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

// Hex accents that line up with ICON_COLORS, used for the thumbnail headline bar.
const ACCENT_HEX = [
  "#ff8a3d", // warm orange
  "#ff4d4d", // vibrant red
  "#34d27b", // fresh green
  "#19c3c3", // teal
  "#4d7dff", // royal blue
  "#9b6dff", // violet purple
  "#ff5fb0", // pink magenta
  "#ffc34d", // golden amber
  "#2fd18a", // emerald green
  "#ff7a66", // coral
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

function accentHexFor(name: string) {
  return ACCENT_HEX[hashOf(name) % ACCENT_HEX.length];
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Greedy word-wrap into at most `maxLines`, truncating the last line with an ellipsis.
function wrapHeadline(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s,.:;]+\S*$/, "").trimEnd() + "…";
  return kept;
}

// Build a YouTube-thumbnail style overlay: a dark bottom scrim, an accent bar and the
// bold headline, rendered as crisp vector text (gpt-image-1 cannot render clean text).
// Returns an SVG buffer the size of the OG image so it can be composited as-is.
export function buildHeadlineOverlay(
  headline: string,
  accent: string,
  width = 1200,
  height = 630
): Buffer {
  const margin = 72;
  const fontSize = 64;
  const lineHeight = Math.round(fontSize * 1.16);
  // ~0.54 average glyph width for a heavy sans-serif at this size.
  const maxChars = Math.max(8, Math.floor((width - margin * 2) / (fontSize * 0.54)));
  const lines = wrapHeadline(headline, maxChars, 3);

  const blockHeight = lines.length * lineHeight;
  const accentBarH = 9;
  const accentBarY = height - margin - blockHeight - 26;
  const firstBaseline = accentBarY + accentBarH + 28 + fontSize;

  const textEls = lines
    .map(
      (ln, i) =>
        `<text x="${margin}" y="${firstBaseline + i * lineHeight}" class="hl">${escapeXml(ln)}</text>`
    )
    .join("");

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.30" stop-color="#000000" stop-opacity="0"/>
      <stop offset="0.72" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.88"/>
    </linearGradient>
    <style>
      .hl {
        font-family: 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif;
        font-weight: 800;
        font-size: ${fontSize}px;
        fill: #ffffff;
        letter-spacing: -0.5px;
        paint-order: stroke;
        stroke: rgba(0,0,0,0.45);
        stroke-width: 4px;
        stroke-linejoin: round;
      }
    </style>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#scrim)"/>
  <rect x="${margin}" y="${accentBarY}" width="92" height="${accentBarH}" rx="4" fill="${accent}"/>
  ${textEls}
</svg>`,
    "utf8"
  );
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
  /**
   * Optional headline to burn onto a landscape image, YouTube-thumbnail style
   * (bold text + accent bar over a dark scrim). Ignored for icons. Pass the
   * article title here to make a share/Discover friendly thumbnail.
   */
  headline?: string;
};

/**
 * Generate an image with OpenAI, optimize it with sharp, upload to S3 and
 * return its public url + key. Throws on a missing key or a failed generation
 * so callers can surface the error.
 */
export async function generateImage(
  name: string,
  { variant = "image", quality = "low", type, headline }: GenerateImageOpts = {}
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
  let optimized: Buffer;
  if (isImage) {
    const headlineText = String(headline ?? "").trim();
    const base = sharp(Buffer.from(b64, "base64")).resize(1200, 630, { fit: "cover" });
    // Burn the headline on as a crisp vector overlay, YouTube-thumbnail style.
    const composed = headlineText
      ? base.composite([{ input: buildHeadlineOverlay(headlineText, accentHexFor(cleanName)), top: 0, left: 0 }])
      : base;
    optimized = await composed.webp({ quality: 82 }).toBuffer();
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
 * Convenience: a landscape featured/OG image for an article or page. By default the
 * article title is burned onto the image as a thumbnail headline (good for social
 * shares and Google Discover). Pass `headline: ""` to get a clean photo with no text.
 */
export function generateFeaturedImage(
  name: string,
  type = "finance blog article",
  quality: GenerateImageOpts["quality"] = "low",
  headline: string | undefined = name
) {
  return generateImage(name, { variant: "image", type, quality, headline });
}
