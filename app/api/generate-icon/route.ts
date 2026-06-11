import { ok, fail, requireAdmin, handleError } from "@/lib/api";
import { generateImage } from "@/lib/ai/image";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // image generation can take a while

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!process.env.OPENAI_API_KEY) return fail("OPENAI_API_KEY is not set. Add it to .env.local.", 500);

  try {
    const { name, type, quality, variant, headline } = await request.json();
    if (!name || !String(name).trim()) return fail("name is required.", 400);

    const isImage = variant === "image";
    // For a landscape image, default the burned-in thumbnail headline to the name.
    // Pass headline: "" to get a clean photo with no text overlay.
    const headlineText =
      typeof headline === "string" ? headline.trim() : isImage ? String(name).trim() : undefined;

    // "image" = landscape social-share / featured image; anything else = square app icon.
    const { url, key } = await generateImage(String(name).trim(), {
      variant: isImage ? "image" : "icon",
      quality: quality === "high" || quality === "medium" ? quality : "low",
      type,
      headline: isImage ? headlineText : undefined,
    });

    return ok({ url, key }, 201);
  } catch (err) {
    return handleError(err);
  }
}
