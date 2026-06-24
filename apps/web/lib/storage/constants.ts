export const FADEN_MEDIA_BUCKET = "faden-media";

export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export const MEDIA_UPLOAD_PURPOSES = [
  "portfolio",
  "verification",
  "alteration",
  "customize",
  "creative",
] as const;

export type MediaUploadPurpose = (typeof MEDIA_UPLOAD_PURPOSES)[number];

export function isMediaUploadPurpose(value: string): value is MediaUploadPurpose {
  return (MEDIA_UPLOAD_PURPOSES as readonly string[]).includes(value);
}
