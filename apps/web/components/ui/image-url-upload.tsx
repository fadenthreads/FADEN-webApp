"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@faden/utils";
import { FormField, TextArea } from "@/components/ui/form-field";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_IMAGES = 8;

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
}

export function ImageUrlUpload({
  label,
  hint,
  value,
  onChange,
  accept = "image/*,video/*",
  maxImages = MAX_IMAGES,
  required,
}: ImageUrlUploadProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const urls = parseUrlLines(value);

  function updateUrls(next: string[]) {
    onChange(joinUrlLines(next.slice(0, maxImages)));
  }

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    setUploadError(null);
    const next = [...urls];

    for (const file of Array.from(files)) {
      if (next.length >= maxImages) break;
      if (file.size > MAX_IMAGE_BYTES) {
        setUploadError(`Each file must be under 2 MB (${file.name} is too large).`);
        continue;
      }

      const dataUrl = await readFileAsDataUrl(file);
      if (dataUrl) next.push(dataUrl);
    }

    updateUrls(next);
    event.target.value = "";
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
          )}
        >
          <span className="text-sm font-medium text-gold">Tap to add photos</span>
          <span className="mt-1 text-xs text-foreground-muted">
            JPG, PNG, or short videos · up to {maxImages} files · 2 MB each
          </span>
          <input
            type="file"
            accept={accept}
            multiple
            className="sr-only"
            onChange={handleFiles}
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
                  aria-label="Remove photo"
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
          placeholder="Or paste image/video URLs, one per line"
          rows={3}
          required={required && urls.length === 0}
        />
      </div>
    </FormField>
  );
}

function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
