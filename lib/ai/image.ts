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

function hashOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

// Pick a dominant color deterministically from the name so images vary instead of all being blue.
function colorFor(name: string) {
  return ICON_COLORS[hashOf(name) % ICON_COLORS.length];
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

// Landscape premium finance blog featured image / Open Graph thumbnail — a highly
// clickable modern fintech infographic with the article title rendered prominently.
// A generous top/bottom safe margin keeps the headline from being clipped when the
// 1536x1024 output is cropped to the 1200x630 OG ratio.
export function buildImagePrompt(name: string, type?: string) {
  const title = String(name).trim();
  return (
    `Create a premium finance blog featured image.\n\n` +
    `TITLE: "${title}"\n\n` +
    `Design a highly clickable, professional blog thumbnail with a clean modern fintech style. Feature the title prominently in large bold typography. Create a visually appealing central illustration that directly represents the article topic using financial concepts, charts, money, calculators, growth graphs, comparison elements, investment visuals, banking icons, or business graphics as appropriate.\n\n` +
    `Use a strong visual hierarchy with the headline as the focal point. Include realistic financial dashboard elements, upward-trending charts, modern infographic components, and premium SaaS-style illustrations. The composition should feel trustworthy, authoritative, and suitable for a leading personal finance website.\n\n` +
    `The image should have depth, subtle shadows, clean spacing, polished UI elements, and professional financial imagery. Avoid clutter. Make it look like a high-performing Google search result thumbnail that encourages clicks.\n\n` +
    `Style keywords: fintech, SaaS, financial dashboard, investment infographic, modern business illustration, premium website banner, editorial quality, high CTR, professional finance blog, clean layout, sharp typography, realistic charts, wealth-building theme, modern digital finance.\n\n` +
    `Aspect ratio: 16:9\n\n` +
    `Framing: keep the entire design — especially the title — inside a centered safe area with a generous empty margin of at least 15% at the top and bottom, so the headline is never clipped at the edges. Spell all text correctly. No logos, no watermark.`
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

  // Images: keep the FULL generated frame (no cropping) — just scale the native
  // 1536x1024 down to a 1200-wide webp so nothing in the design is ever cut off.
  // Icons: square, transparent.
  let optimized: Buffer;
  if (isImage) {
    optimized = await sharp(Buffer.from(b64, "base64"))
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
  } else {
    optimized = await sharp(Buffer.from(b64, "base64"))
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 90 })
      .toBuffer();
  }

  const key = buildKey(`${cleanName}.webp`, isImage ? "og" : "icons");
  return uploadToS3(optimized, key, "image/webp");
}

/**
 * Convenience: a landscape featured/OG image for an article or page. Returns a clean
 * infographic generated straight from the prompt — no title or headline text is ever
 * burned onto the image.
 */
export function generateFeaturedImage(
  name: string,
  type = "finance blog article",
  quality: GenerateImageOpts["quality"] = "low"
) {
  return generateImage(name, { variant: "image", type, quality });
}
