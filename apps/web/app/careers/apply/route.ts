import { NextResponse, type NextRequest } from "next/server";
import { careerApplicationSchema } from "@faden/validators";
import { submitCareerApplication } from "@/lib/careers/submit-career-application";
import { validateResumeUpload } from "@/lib/storage/upload-career-resume";
import { isAdminClientConfigured } from "@/lib/supabase/admin";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!isAdminClientConfigured()) {
    return errorResponse("Applications are temporarily unavailable.", 503);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid form submission.", 400);
  }

  const resumeEntry = formData.get("resume");
  if (!(resumeEntry instanceof File) || resumeEntry.size === 0) {
    return errorResponse("Please attach your resume.", 400);
  }

  const resumeValidation = validateResumeUpload({ size: resumeEntry.size, type: resumeEntry.type });
  if (resumeValidation) {
    return errorResponse(resumeValidation, 400);
  }

  const parsed = careerApplicationSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    roleInterest: String(formData.get("roleInterest") ?? ""),
    linkedinUrl: String(formData.get("linkedinUrl") ?? ""),
    portfolioUrl: String(formData.get("portfolioUrl") ?? ""),
    coverNote: String(formData.get("coverNote") ?? ""),
  });

  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? "Please check the form.", 400);
  }

  const buffer = Buffer.from(await resumeEntry.arrayBuffer());

  const result = await submitCareerApplication(parsed.data, {
    buffer,
    mimeType: resumeEntry.type,
    fileName: resumeEntry.name || "resume",
  });

  if (!result.ok) {
    return errorResponse(result.error, 400);
  }

  return NextResponse.json({ ok: true, applicationId: result.applicationId });
}
