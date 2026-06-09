import { NextResponse } from "next/server";
import { buildKey, uploadToS3 } from "@/lib/s3";

// Uploads handle binary data; never cache.
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

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
      return NextResponse.json({ error: "File too large (max 5 MB)." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = buildKey(file.name);

    const { url } = await uploadToS3(buffer, key, file.type);

    // Return the URL so callers can store it on a model field
    // (avatar / thumbnail / featuredImage).
    return NextResponse.json(
      { url, key, filename: file.name, contentType: file.type, size: file.size },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
