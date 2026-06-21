"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { FormField, TextArea } from "@/components/ui/form-field";

const MAX_MIX_IMAGES = 4;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) return;

    const remaining = MAX_MIX_IMAGES - images.length;
    if (remaining <= 0) return;

    const nextImages = [...images];

    for (const file of files.slice(0, remaining)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_IMAGE_BYTES) continue;

      const dataUrl = await readFileAsDataUrl(file);
      nextImages.push(dataUrl);
    }

    onImagesChange(nextImages.slice(0, MAX_MIX_IMAGES));
  }

  function removeImage(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <FormField
        label="Mixing two outfits?"
        hint="Describe what you want from each reference. Discuss feasibility with the boutique before combining elements from two designs."
      >
        <TextArea
          placeholder="From outfit 1 I want the sleeve… from outfit 2 the skirt…"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
        />
      </FormField>

      <FormField
        label="Outfit reference links"
        hint="Paste one link per line — Pinterest, Instagram, shopping sites, etc."
      >
        <TextArea
          placeholder="https://…&#10;https://…"
          value={links}
          onChange={(event) => onLinksChange(event.target.value)}
        />
      </FormField>

      <FormField
        label="Outfit reference pictures"
        hint={`Upload up to ${MAX_MIX_IMAGES} images (max 2 MB each).`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="faden-field cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-3 file:py-1 file:text-xs file:font-medium file:text-gold"
          onChange={handleFilesSelected}
          disabled={images.length >= MAX_MIX_IMAGES}
        />
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
