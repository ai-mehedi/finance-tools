import { NextResponse } from "next/server";
import sharp from "sharp";
import { buildKey, uploadToS3 } from "@/lib/s3";

// Uploads handle binary data; never cache.
export const dynamic = "force-dynamic";

// Accept larger originals (we compress them down on the server before storing).
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

// Compression targets: cap the longest edge and re-encode as WebP. 1600px is plenty
// for a full-width blog/featured image; quality 82 is visually lossless for photos
// and graphics while cutting a 5 MB+ PNG down to a few hundred KB.
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided (field name must be 'file')." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 15 MB)." }, { status: 413 });
    }

    const original = Buffer.from(await file.arrayBuffer());

    // Auto-compress: downscale oversized images and re-encode as WebP so big source
    // files (e.g. a 5 MB AI image) land in S3 as a small, sharp ~200-600 KB file.
    // Animated GIFs are stored untouched so their animation isn't flattened.
    let body: Buffer = original;
    let contentType = file.type;
    let filename = file.name;

    if (file.type !== "image/gif") {
      try {
        body = await sharp(original)
          .rotate() // honor EXIF orientation before metadata is dropped
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
        contentType = "image/webp";
        filename = file.name.replace(/\.[^.]+$/, "") + ".webp";
      } catch (err) {
        // If sharp can't process it, fall back to storing the original as-is.
        console.error("Image compression failed, storing original:", file.name, err);
        body = original;
        contentType = file.type;
        filename = file.name;
      }
    }

    const key = buildKey(filename);
    const { url } = await uploadToS3(body, key, contentType);

    // Return the URL so callers can store it on a model field
    // (avatar / thumbnail / featuredImage). `size` is the stored (compressed) size;
    // `originalSize` is what was uploaded, so callers can show the savings.
    return NextResponse.json(
      { url, key, filename, contentType, size: body.length, originalSize: file.size },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
