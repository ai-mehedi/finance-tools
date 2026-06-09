"use client";

import { useState } from "react";

type Upload = {
  url: string;
  key: string;
  filename: string;
  size: number;
  contentType: string;
};

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<Upload | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setMedia(null);
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setMedia(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-extrabold text-zinc-900">Image Upload Test</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Uploads to S3 via <code className="rounded bg-zinc-100 px-1">/api/upload</code> and
        returns the public URL. Requires S3 env vars in{" "}
        <code className="rounded bg-zinc-100 px-1">.env.local</code>.
      </p>

      <label className="mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-10 text-center transition-colors hover:border-orange-400 hover:bg-orange-50">
        <span className="text-3xl">📤</span>
        <span className="text-sm font-semibold text-zinc-700">
          {uploading ? "Uploading…" : "Click to choose an image"}
        </span>
        <span className="text-xs text-zinc-400">JPEG, PNG, WebP, GIF, AVIF · max 5 MB</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleChange}
        />
      </label>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}

      {media && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-semibold text-emerald-600">✓ Uploaded</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.url} alt={media.filename} referrerPolicy="no-referrer" className="mt-3 max-h-64 rounded-lg" />
          <p className="mt-3 break-all text-xs text-zinc-500">{media.url}</p>
        </div>
      )}
    </div>
  );
}
