import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

/**
 * A single shared S3 client. Credentials are read from the standard
 * AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars by the SDK.
 */
export const s3 = new S3Client({
  region: region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export function getBucketName(): string {
  if (!bucket) {
    throw new Error("AWS_S3_BUCKET is not set. Add it to your .env.local file.");
  }
  return bucket;
}

/** Build a public URL for a stored object key. */
export function publicUrl(key: string): string {
  // Serve via the CDN domain when configured (e.g. https://cdn.topicdrill.com).
  const base = process.env.CDN_URL;
  if (base) return `${base.replace(/\/$/, "")}/${key}`;
  return `https://${getBucketName()}.s3.${region}.amazonaws.com/${key}`;
}

/** Generate a unique, collision-safe object key that keeps the file extension. */
export function buildKey(filename: string, prefix = "uploads"): string {
  const ext = filename.includes(".") ? filename.split(".").pop() : "";
  const safe = ext ? `.${ext.toLowerCase()}` : "";
  return `${prefix}/${randomUUID()}${safe}`;
}

/** Upload a buffer to S3 and return its key + public url. */
export async function uploadToS3(
  body: Buffer,
  key: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return { key, url: publicUrl(key) };
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: getBucketName(), Key: key })
  );
}
