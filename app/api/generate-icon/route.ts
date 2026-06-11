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

// Landscape photographic hero image for Open Graph / social-share cards and article
// featured images — a realistic editorial photo with a background, NOT an illustration
// or a transparent app icon.
function buildImagePrompt(name: string, type?: string) {
  const subject = type ? `${type}: "${name}"` : `"${name}"`;
  const color = colorFor(name);
  return (
    `A photorealistic editorial photograph for ${subject}, used as a featured image and social-share / Open Graph card. ` +
    `Real-world photography, shot on a full-frame DSLR with a 35mm lens, natural lighting, shallow depth of field with a softly blurred background (bokeh), ` +
    `depicting a relevant real personal-finance scene (a real person at a desk with a laptop, real banknotes and coins, printed documents, a calculator, a smartphone showing a banking app, or a cozy home-office, whatever best fits the topic), ` +
    `cinematic color grading with a subtle ${color} tone, clear focal point with generous negative space, balanced wide landscape composition, true-to-life textures and realistic shadows, ` +
    `high-resolution magazine-quality stock photo, sharp and professional, no text, no logos, no watermark, not an illustration, not a cartoon, not a 3D render, not flat vector art.`
  );
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fail("OPENAI_API_KEY is not set. Add it to .env.local.", 500);

  try {
    const { name, type, quality, variant } = await request.json();
    if (!name || !String(name).trim()) return fail("name is required.", 400);

    // "image" = landscape social-share / featured image; anything else = square app icon.
    const isImage = variant === "image";
    const cleanName = String(name).trim();

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: isImage ? buildImagePrompt(cleanName, type) : buildPrompt(cleanName, type),
        size: isImage ? "1536x1024" : "1024x1024", // landscape vs square
        background: isImage ? "opaque" : "transparent",
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

    // Images: crop to the 1.91:1 Open Graph ratio (1200x630). Icons: square, transparent.
    const optimized = isImage
      ? await sharp(Buffer.from(b64, "base64"))
          .resize(1200, 630, { fit: "cover" })
          .webp({ quality: 82 })
          .toBuffer()
      : await sharp(Buffer.from(b64, "base64"))
          .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ quality: 90 })
          .toBuffer();

    const key = buildKey(`${cleanName}.webp`, isImage ? "og" : "icons");
    const { url } = await uploadToS3(optimized, key, "image/webp");

    return ok({ url, key }, 201);
  } catch (err) {
    return handleError(err);
  }
}
