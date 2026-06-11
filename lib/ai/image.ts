// Shared AI image generation: OpenAI gpt-image-1 -> sharp crop -> S3 upload.
//
// Used by the admin generate-icon route (square icons + landscape OG images)
// and by the article pipeline (featured images). Keeping the logic here means
// one place to tune prompts, sizes and the S3 key layout.

import sharp from "sharp";
import { buildKey, uploadToS3 } from "@/lib/s3";

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

// Pick a dominant color deterministically from the name so images vary instead of all being blue.
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ICON_COLORS[h % ICON_COLORS.length];
}

export function buildIconPrompt(name: string, type?: string) {
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
export function buildImagePrompt(name: string, type?: string) {
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

export type GenerateImageOpts = {
  /** "image" = landscape OG/featured image (1200x630); "icon" = square transparent app icon. */
  variant?: "image" | "icon";
  /** gpt-image-1 quality. Defaults to "low" to keep cost down. */
  quality?: "low" | "medium" | "high";
  /** Optional subject type, e.g. "finance blog article". */
  type?: string;
};

/**
 * Generate an image with OpenAI, optimize it with sharp, upload to S3 and
 * return its public url + key. Throws on a missing key or a failed generation
 * so callers can surface the error.
 */
export async function generateImage(
  name: string,
  { variant = "image", quality = "low", type }: GenerateImageOpts = {}
): Promise<{ url: string; key: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set. Add it to .env.local.");

  const cleanName = String(name).trim();
  if (!cleanName) throw new Error("name is required.");

  const isImage = variant === "image";

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: isImage ? buildImagePrompt(cleanName, type) : buildIconPrompt(cleanName, type),
      size: isImage ? "1536x1024" : "1024x1024", // landscape vs square
      background: isImage ? "opaque" : "transparent",
      output_format: "png",
      quality: quality === "high" || quality === "medium" ? quality : "low",
      n: 1,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Image generation failed.");

  const b64 = data?.data?.[0]?.b64_json as string | undefined;
  if (!b64) throw new Error("No image returned from OpenAI.");

  // Images: crop to the 1.91:1 Open Graph ratio (1200x630). Icons: square, transparent.
  const optimized = isImage
    ? await sharp(Buffer.from(b64, "base64")).resize(1200, 630, { fit: "cover" }).webp({ quality: 82 }).toBuffer()
    : await sharp(Buffer.from(b64, "base64"))
        .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 90 })
        .toBuffer();

  const key = buildKey(`${cleanName}.webp`, isImage ? "og" : "icons");
  return uploadToS3(optimized, key, "image/webp");
}

/** Convenience: a landscape featured/OG image for an article or page. */
export function generateFeaturedImage(name: string, type = "finance blog article", quality: GenerateImageOpts["quality"] = "low") {
  return generateImage(name, { variant: "image", type, quality });
}
