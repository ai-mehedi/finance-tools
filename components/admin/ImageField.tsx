"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, Loader2, ImageIcon, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ImageField({
  label = "Image",
  value,
  onChange,
  generateName,
  generateType,
}: {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  /** When provided, shows an "AI generate" button that creates a 3D icon from this name. */
  generateName?: string;
  generateType?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function generate() {
    const name = generateName?.trim();
    if (!name) {
      setError("Enter a title first, then generate.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-icon", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, type: generateType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div>
      <Label>{label}</Label>

      {value ? (
        // Preview
        <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" referrerPolicy="no-referrer" className="h-44 w-full object-contain" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg bg-rose-500 p-1.5 text-white shadow-sm hover:bg-rose-600"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <p className="truncate border-t border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-400">{value}</p>
        </div>
      ) : (
        // Dropzone
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            dragging ? "border-orange-400 bg-orange-50" : "border-zinc-300 bg-zinc-50 hover:border-orange-300 hover:bg-orange-50/40"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-orange-500" />
              <p className="text-sm font-medium text-zinc-500">Uploading…</p>
            </>
          ) : (
            <>
              <span className="flex size-11 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                <UploadCloud className="size-5" />
              </span>
              <p className="text-sm font-medium text-zinc-700">
                <span className="text-orange-600">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-zinc-400">PNG, JPG, WebP, GIF, AVIF · max 5 MB</p>
            </>
          )}
        </div>
      )}

      {/* Paste URL fallback */}
      <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
        <ImageIcon className="size-3.5 shrink-0" />
        <input
          type="url"
          placeholder="or paste an image URL"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent p-0 text-xs text-zinc-600 outline-none placeholder:text-zinc-400"
        />
      </div>

      {generateName !== undefined && (
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-60"
        >
          {generating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          {generating ? "Generating 3D icon…" : value ? "Regenerate 3D icon" : "Generate 3D icon with AI"}
        </button>
      )}

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) upload(file);
        }}
      />
    </div>
  );
}
