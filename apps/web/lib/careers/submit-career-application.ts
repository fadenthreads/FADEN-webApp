import { randomUUID } from "crypto";
import type { CareerApplicationInput } from "@faden/validators";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadCareerResume } from "@/lib/storage/upload-career-resume";

export async function submitCareerApplication(
  input: CareerApplicationInput,
  resume: { buffer: Buffer; mimeType: string; fileName: string },
): Promise<{ ok: true; applicationId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Applications are temporarily unavailable." };
  }

  const applicationId = randomUUID();

  let resumePath: string;
  try {
    const uploaded = await uploadCareerResume({
      applicationId,
      buffer: resume.buffer,
      mimeType: resume.mimeType,
      originalName: resume.fileName,
    });
    resumePath = uploaded.path;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resume upload failed.";
    return { ok: false, error: message };
  }

  const { error } = await admin.from("career_applications").insert({
    id: applicationId,
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    role_interest: input.roleInterest.trim(),
    linkedin_url: input.linkedinUrl?.trim() || null,
    portfolio_url: input.portfolioUrl?.trim() || null,
    cover_note: input.coverNote?.trim() || null,
    resume_path: resumePath,
    resume_file_name: resume.fileName,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, applicationId };
}
