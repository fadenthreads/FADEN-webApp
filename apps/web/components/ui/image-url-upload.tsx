"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { cn } from "@faden/utils";
import { FormField, TextArea } from "@/components/ui/form-field";
import { MAX_MEDIA_BYTES, uploadMediaFile } from "@/lib/storage/client-upload";
import type { MediaUploadPurpose } from "@/lib/storage/constants";

const MAX_IMAGES = 8;
const MAX_MB = Math.round(MAX_MEDIA_BYTES / (1024 * 1024));

function parseUrlLines(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinUrlLines(urls: string[]): string {
  return urls.join("\n");
}

interface ImageUrlUploadProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  maxImages?: number;
  required?: boolean;
  purpose?: MediaUploadPurpose;
}

export function ImageUrlUpload({
  label,
  hint,
  value,
  onChange,
  accept = "image/*,video/*",
  maxImages = MAX_IMAGES,
  required,
  purpose = "verification",
}: ImageUrlUploadProps) {
  const tu = useTranslations("Upload");
  const tc = useTranslations("Common");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const urls = parseUrlLines(value);

  function updateUrls(next: string[]) {
    onChange(joinUrlLines(next.slice(0, maxImages)));
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    setUploadError(null);
    setUploading(true);
    const next = [...urls];

    try {
      for (const file of Array.from(files)) {
        if (next.length >= maxImages) break;

        try {
          const uploaded = await uploadMediaFile(file, purpose);
          next.push(uploaded.url);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : tc("uploadFailed"));
        }
      }

      updateUrls(next);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeUrl(index: number) {
    updateUrls(urls.filter((_, i) => i !== index));
  }

  return (
    <FormField label={label} hint={hint}>
      <div className="space-y-3">
        <label
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors hover:border-gold/40 hover:bg-gold/5",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <span className="text-sm font-medium text-gold">
            {uploading ? tc("uploading") : tu("tapToAdd")}
          </span>
          <span className="mt-1 text-xs text-foreground-muted">
            {tu("fileHint", { maxImages, maxMb: MAX_MB })}
          </span>
          <input
            type="file"
            accept={accept}
            multiple
            className="sr-only"
            onChange={handleFiles}
            disabled={uploading}
          />
        </label>

        {uploadError && (
          <p className="text-sm text-red-accent">{uploadError}</p>
        )}

        {urls.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {urls.map((url, index) => (
              <div key={`${url.slice(0, 32)}-${index}`} className="relative overflow-hidden rounded-lg border border-border">
                {url.startsWith("data:video") || /\.(mp4|webm|mov)(\?|$)/i.test(url) ? (
                  <video src={url} className="aspect-square w-full object-cover" muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="aspect-square w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeUrl(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  aria-label={tu("removePhoto")}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={tu("pasteUrls")}
          rows={3}
          required={required && urls.length === 0}
        />
      </div>
    </FormField>
  );
}
