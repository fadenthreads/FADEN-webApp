"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { MAX_MEDIA_BYTES, uploadMediaFile } from "@/lib/storage/client-upload";

export const MAX_DESIGN_REFERENCE_IMAGES = 4;
export const MAX_DESIGN_IMAGE_BYTES = MAX_MEDIA_BYTES;

interface DesignReferenceUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  label?: string;
  hint?: string;
}

export function DesignReferenceUpload({
  images,
  onImagesChange,
  label = "Reference photos",
  hint = `Upload up to ${MAX_DESIGN_REFERENCE_IMAGES} images (max ${Math.round(MAX_MEDIA_BYTES / (1024 * 1024))} MB each).`,
}: DesignReferenceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) return;

    const remaining = MAX_DESIGN_REFERENCE_IMAGES - images.length;
    if (remaining <= 0) return;

    setUploadError(null);
    setUploading(true);
    const nextImages = [...images];

    try {
      for (const file of files.slice(0, remaining)) {
        if (!file.type.startsWith("image/")) continue;

        try {
          const uploaded = await uploadMediaFile(file, "customize");
          nextImages.push(uploaded.url);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "Upload failed");
        }
      }

      onImagesChange(nextImages.slice(0, MAX_DESIGN_REFERENCE_IMAGES));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-foreground-muted">{hint}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="faden-field mt-2 cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-3 file:py-1 file:text-xs file:font-medium file:text-gold"
        onChange={handleFilesSelected}
        disabled={images.length >= MAX_DESIGN_REFERENCE_IMAGES || uploading}
      />
      {uploading && (
        <p className="mt-2 text-xs text-foreground-muted">Uploading…</p>
      )}
      {uploadError && (
        <p className="mt-2 text-xs text-red-accent">{uploadError}</p>
      )}
      {images.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((src, index) => (
            <li
              key={`${index}-${src.slice(0, 32)}`}
              className="relative overflow-hidden rounded-lg border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Reference ${index + 1}`} className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground-muted hover:text-red-accent"
                aria-label={`Remove reference image ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
