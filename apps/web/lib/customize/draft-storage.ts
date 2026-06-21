import type { CustomizeFormData } from "@/data/customize-form";

export const CUSTOMIZE_DRAFT_KEY = "faden:customize-draft";

export function saveCustomizeDraft(data: CustomizeFormData): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CUSTOMIZE_DRAFT_KEY, JSON.stringify(data));
}

export function loadCustomizeDraft(): CustomizeFormData | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CUSTOMIZE_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomizeFormData;
  } catch {
    return null;
  }
}

export function clearCustomizeDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CUSTOMIZE_DRAFT_KEY);
}

export function updateDraftSelectedBoutique(slug: string): CustomizeFormData | null {
  const draft = loadCustomizeDraft();
  if (!draft) return null;
  const updated = { ...draft, selectedBoutiqueSlug: slug };
  saveCustomizeDraft(updated);
  return updated;
}
