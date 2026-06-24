import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWebSupabaseEnv } from "@/lib/supabase/env";
import {
  ALLOWED_MEDIA_MIME_TYPES,
  FADEN_MEDIA_BUCKET,
  MAX_MEDIA_BYTES,
  type MediaUploadPurpose,
} from "@/lib/storage/constants";

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/quicktime":
      return "mov";
    default:
      return "bin";
  }
}

export function getPublicMediaUrl(objectPath: string): string {
  const { url } = getWebSupabaseEnv();
  const normalized = objectPath.replace(/^\/+/, "");
  return `${url}/storage/v1/object/public/${FADEN_MEDIA_BUCKET}/${normalized}`;
}

export function validateMediaUpload(file: { size: number; type: string }): string | null {
  if (file.size > MAX_MEDIA_BYTES) {
    return `File must be under ${Math.round(MAX_MEDIA_BYTES / (1024 * 1024))} MB.`;
  }
  if (!ALLOWED_MEDIA_MIME_TYPES.has(file.type)) {
    return "Unsupported file type. Use JPG, PNG, WebP, GIF, or MP4/WebM video.";
  }
  return null;
}

export async function uploadMediaBuffer(options: {
  userId: string;
  purpose: MediaUploadPurpose;
  buffer: Buffer;
  mimeType: string;
  originalName?: string;
}): Promise<{ path: string; publicUrl: string }> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.");
  }

  const validationError = validateMediaUpload({ size: options.buffer.length, type: options.mimeType });
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = extensionForMime(options.mimeType);
  const safeName = (options.originalName ?? "upload")
    .replace(/[^\w.-]+/g, "-")
    .slice(0, 40);
  const objectPath = `${options.purpose}/${options.userId}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}.${ext}`;

  const { error } = await admin.storage.from(FADEN_MEDIA_BUCKET).upload(objectPath, options.buffer, {
    contentType: options.mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    path: objectPath,
    publicUrl: getPublicMediaUrl(objectPath),
  };
}
