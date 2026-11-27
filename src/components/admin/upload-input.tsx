"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { adminInput } from "./ui";
import { cn } from "@/lib/utils";

/**
 * File upload + URL field.
 *
 * Images are re-encoded to WebP on the server; PDFs are accepted for study
 * materials. The stored URL is what the CMS saves.
 */
export function UploadInput({
  value,
  onChange,
  kind = "image",
  id,
  disabled,
  uploadEndpoint = "/api/admin/uploads",
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  kind?: "image" | "file";
  id?: string;
  disabled?: boolean;
  uploadEndpoint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const current = value ?? "";
  const isImage =
    kind === "image" ||
    /\.(jpe?g|png|webp|avif|gif)(\?.*)?$/i.test(current) ||
    current.startsWith("/uploads/");

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(uploadEndpoint, { method: "POST", body: fd, credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed. Try a different file.");
        return;
      }
      onChange(data.upload.url);
    } catch {
      setError("Network error while uploading. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        {current && isImage ? (
          <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-paper-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current} alt="" className="h-full w-full object-cover" />
          </span>
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-line bg-paper-2 text-muted">
            <Icon name={kind === "image" ? "image" : "file"} className="h-5 w-5" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <input
              id={id}
              type="text"
              value={current}
              onChange={(e) => onChange(e.target.value || null)}
              placeholder={kind === "image" ? "/uploads/… or https://…" : "/uploads/…pdf or https://…"}
              className={adminInput}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || disabled}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[11.5px] font-extrabold text-navy transition hover:border-blue/40 hover:bg-blue-100/50 disabled:opacity-60"
            >
              {uploading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy/25 border-t-navy" />
              ) : (
                <Icon name="plus" className="h-3.5 w-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </button>
            {current && (
              <button
                type="button"
                onClick={() => onChange(null)}
                disabled={disabled}
                aria-label="Remove file"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line bg-white text-muted transition hover:bg-[#FFF1F4] hover:text-[#A32D4B]"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="mt-1 text-[10px] font-semibold text-muted">
            {kind === "image"
              ? "JPG, PNG, WebP or AVIF · max 12 MB · resized automatically"
              : "Images or PDF · max 12 MB"}
          </p>
          {error && <p className="mt-1 text-[10.5px] font-bold text-[#C23B5A]">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/avif" : "image/jpeg,image/png,image/webp,image/avif,application/pdf"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
