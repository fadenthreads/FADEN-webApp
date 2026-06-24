"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { FormField, TextArea } from "@/components/ui/form-field";
import { MAX_MEDIA_BYTES, uploadMediaFile } from "@/lib/storage/client-upload";

const MAX_MIX_IMAGES = 4;
const MAX_MB = Math.round(MAX_MEDIA_BYTES / (1024 * 1024));

interface MixOutfitReferencesProps {
  notes: string;
  links: string;
  images: string[];
  onNotesChange: (value: string) => void;
  onLinksChange: (value: string) => void;
  onImagesChange: (images: string[]) => void;
}

export function MixOutfitReferences({
  notes,
  links,
  images,
  onNotesChange,
  onLinksChange,
  onImagesChange,
}: MixOutfitReferencesProps) {
  const t = useTranslations("Customize.mixOutfit");
  const tc = useTranslations("Common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) return;

    const remaining = MAX_MIX_IMAGES - images.length;
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
          setUploadError(err instanceof Error ? err.message : tc("uploadFailed"));
        }
      }

      onImagesChange(nextImages.slice(0, MAX_MIX_IMAGES));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <FormField label={t("label")} hint={t("hint")}>
        <TextArea
          placeholder={t("notesPlaceholder")}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
        />
      </FormField>

      <FormField label={t("linksLabel")} hint={t("linksHint")}>
        <TextArea
          placeholder="https://…&#10;https://…"
          value={links}
          onChange={(event) => onLinksChange(event.target.value)}
        />
      </FormField>

      <FormField
        label={t("photosLabel")}
        hint={t("photosHint", { max: MAX_MIX_IMAGES, maxMb: MAX_MB })}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="faden-field cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-3 file:py-1 file:text-xs file:font-medium file:text-gold"
          onChange={handleFilesSelected}
          disabled={images.length >= MAX_MIX_IMAGES || uploading}
        />
        {uploading && (
          <p className="mt-2 text-xs text-foreground-muted">{tc("uploading")}</p>
        )}
        {uploadError && (
          <p className="mt-2 text-xs text-red-accent">{uploadError}</p>
        )}
        {images.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((src, index) => (
              <li key={`${index}-${src.slice(0, 32)}`} className="relative overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Outfit reference ${index + 1}`} className="aspect-square w-full object-cover" />
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
      </FormField>
    </div>
  );
}
