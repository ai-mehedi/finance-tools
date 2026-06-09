import sharp from "sharp";
import { buildKey, uploadToS3 } from "@/lib/s3";
import { ok, fail, requireAdmin, handleError } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // image generation can take a while

const ENDPOINT = "https://api.openai.com/v1/images/generations";

const ICON_COLORS = [
  "warm orange",
  "vibrant red",
  "fresh green",
  "teal",
  "royal blue",
  "violet purple",
  "pink magenta",
  "golden amber",
  "emerald green",
  "coral",
];

// Pick a dominant color deterministically from the name so icons vary instead of all being blue.
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ICON_COLORS[h % ICON_COLORS.length];
}

function buildPrompt(name: string, type?: string) {
  const subject = type ? `${type} "${name}"` : `"${name}"`;
  const color = colorFor(name);
  return (
    `A modern 2.5D glossy app icon representing ${subject}, Google Material / fluent icon style, ` +
    `semi-flat with subtle depth and soft drop shadow, smooth rounded shapes, clean vector look, ` +
    `a bold ${color} dominant color scheme with subtle complementary accent colors, soft gradients and a glossy highlight, ` +
    `single centered object, minimal and friendly, no text, no background, transparent background, ` +
    `square composition, crisp and high quality.`
  );
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fail("OPENAI_API_KEY is not set. Add it to .env.local.", 500);

  try {
    const { name, type, quality } = await request.json();
    if (!name || !String(name).trim()) return fail("name is required.", 400);

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: buildPrompt(String(name).trim(), type),
        size: "1024x1024", // square
        background: "transparent",
        output_format: "png",
        quality: quality === "high" || quality === "medium" ? quality : "low",
        n: 1,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const message = data?.error?.message ?? "Image generation failed.";
      return fail(message, res.status);
    }

    const b64 = data?.data?.[0]?.b64_json as string | undefined;
    if (!b64) return fail("No image returned from OpenAI.", 502);

    // Resize to 512px and convert to WebP (keeps transparency, ~30-60KB instead of ~1.5MB PNG).
    const optimized = await sharp(Buffer.from(b64, "base64"))
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer();

    const key = buildKey(`${name}.webp`, "icons");
    const { url } = await uploadToS3(optimized, key, "image/webp");

    return ok({ url, key }, 201);
  } catch (err) {
    return handleError(err);
  }
}
