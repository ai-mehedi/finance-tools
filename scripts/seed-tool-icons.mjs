// Generate a 2.5D icon for every tool without one, optimize to WebP, upload to S3, save URL.
// Run: node --env-file=.env.local scripts/seed-tool-icons.mjs
import mongoose from "mongoose";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const { MONGODB_URI, OPENAI_API_KEY, AWS_REGION, AWS_S3_BUCKET, CDN_URL } = process.env;
for (const [k, v] of Object.entries({ MONGODB_URI, OPENAI_API_KEY, AWS_S3_BUCKET })) {
  if (!v) { console.error(`${k} is not set.`); process.exit(1); }
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
});

const Tool = mongoose.model(
  "Tool",
  new mongoose.Schema({ title: String, slug: String, thumbnail: String, type: String }, { timestamps: true })
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ICON_COLORS = ["warm orange","vibrant red","fresh green","teal","royal blue","violet purple","pink magenta","golden amber","emerald green","coral"];
function colorFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ICON_COLORS[h % ICON_COLORS.length];
}
function prompt(name) {
  return (
    `A modern 2.5D glossy app icon representing finance calculator "${name}", Google Material / fluent icon style, ` +
    `semi-flat with subtle depth and soft drop shadow, smooth rounded shapes, clean vector look, ` +
    `a bold ${colorFor(name)} dominant color scheme with subtle complementary accent colors, soft gradients and a glossy highlight, ` +
    `single centered object, minimal and friendly, no text, transparent background, square composition, crisp and high quality.`
  );
}

async function openaiImage(name, attempt = 1) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: prompt(name),
      size: "1024x1024",
      background: "transparent",
      output_format: "png",
      quality: "low",
      n: 1,
    }),
  });
  const data = await res.json();
  if (res.status === 429 && attempt <= 20) {
    await sleep(14000);
    return openaiImage(name, attempt + 1);
  }
  if (!res.ok) throw new Error(data?.error?.message ?? "OpenAI error");
  return data;
}

async function generate(name) {
  const data = await openaiImage(name);
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned");
  const webp = await sharp(Buffer.from(b64, "base64"))
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toBuffer();
  const key = `icons/${randomUUID()}.webp`;
  await s3.send(new PutObjectCommand({ Bucket: AWS_S3_BUCKET, Key: key, Body: webp, ContentType: "image/webp" }));
  return `${(CDN_URL || "").replace(/\/$/, "")}/${key}`;
}

await mongoose.connect(MONGODB_URI);
const FORCE = process.env.FORCE === "1";
const tools = await Tool.find(FORCE ? {} : { $or: [{ thumbnail: { $exists: false } }, { thumbnail: "" }, { thumbnail: null }] });
console.log(`Generating icons for ${tools.length} tools…`);

const POOL = 2;
let done = 0, failed = 0;
async function worker(queue) {
  for (const t of queue) {
    try {
      t.thumbnail = await generate(t.title);
      await t.save();
      done++;
      if (done % 10 === 0 || done === 1) console.log(`  …${done}/${tools.length} done (latest: ${t.title})`);
    } catch (e) {
      failed++;
      console.log(`  ✗ ${t.title}: ${e.message}`);
    }
  }
}
const chunks = Array.from({ length: POOL }, (_, i) => tools.filter((_, idx) => idx % POOL === i));
await Promise.all(chunks.map(worker));

console.log(`\n✓ Done: ${done} icons saved, ${failed} failed.`);
await mongoose.disconnect();
