import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const FADEN_DOCUMENTS_BUCKET = "faden-documents";
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const ALLOWED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function extensionForMime(mime: string): string {
  switch (mime) {
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    default:
      return "bin";
  }
}

export function validateResumeUpload(file: { size: number; type: string }): string | null {
  if (file.size > MAX_RESUME_BYTES) {
    return "Resume must be under 5 MB.";
  }
  if (!ALLOWED_RESUME_MIME_TYPES.has(file.type)) {
    return "Upload a PDF or Word document (.pdf, .doc, .docx).";
  }
  return null;
}

export async function uploadCareerResume(options: {
  applicationId: string;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}): Promise<{ path: string }> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY.");
  }

  const validationError = validateResumeUpload({ size: options.buffer.length, type: options.mimeType });
  if (validationError) {
    throw new Error(validationError);
  }

  const ext = extensionForMime(options.mimeType);
  const safeName = options.originalName.replace(/[^\w.-]+/g, "-").slice(0, 60);
  const objectPath = `careers/${options.applicationId}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}.${ext}`;

  const { error } = await admin.storage.from(FADEN_DOCUMENTS_BUCKET).upload(objectPath, options.buffer, {
    contentType: options.mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { path: objectPath };
}
