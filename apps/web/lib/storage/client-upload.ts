import { isBrowserSupabaseConfigured } from "@/lib/supabase/client";
import { MAX_MEDIA_BYTES, type MediaUploadPurpose } from "@/lib/storage/constants";
import { readFileAsDataUrl } from "@/lib/storage/read-file-data-url";

export { MAX_MEDIA_BYTES };

export interface UploadMediaResult {
  url: string;
  source: "storage" | "data-url";
}

export async function uploadMediaFile(
  file: File,
  purpose: MediaUploadPurpose,
): Promise<UploadMediaResult> {
  if (file.size > MAX_MEDIA_BYTES) {
    throw new Error(`File must be under ${Math.round(MAX_MEDIA_BYTES / (1024 * 1024))} MB.`);
  }

  if (isBrowserSupabaseConfigured()) {
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("purpose", purpose);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body,
      });

      const payload = (await res.json()) as { ok?: boolean; url?: string; error?: string };

      if (res.ok && payload.ok && payload.url) {
        return { url: payload.url, source: "storage" };
      }

      if (res.status !== 503 && res.status !== 401) {
        throw new Error(payload.error ?? "Upload failed");
      }
    } catch (err) {
      if (err instanceof Error && !/storage is not configured|sign in/i.test(err.message)) {
        throw err;
      }
    }
  }

  const dataUrl = await readFileAsDataUrl(file);
  return { url: dataUrl, source: "data-url" };
}
