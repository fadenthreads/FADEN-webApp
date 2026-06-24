import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { isMediaUploadPurpose } from "@/lib/storage/constants";
import { uploadMediaBuffer, validateMediaUpload } from "@/lib/storage/upload-media";

export async function POST(request: NextRequest) {
  if (!isAdminClientConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Storage is not configured on the server." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in to upload files." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload payload." }, { status: 400 });
  }

  const file = formData.get("file");
  const purpose = String(formData.get("purpose") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
  }

  if (!isMediaUploadPurpose(purpose)) {
    return NextResponse.json({ ok: false, error: "Invalid upload purpose." }, { status: 400 });
  }

  const validationError = validateMediaUpload({ size: file.size, type: file.type });
  if (validationError) {
    return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadMediaBuffer({
      userId: user.id,
      purpose,
      buffer,
      mimeType: file.type,
      originalName: file.name,
    });

    return NextResponse.json({ ok: true, url: uploaded.publicUrl, path: uploaded.path });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status = /bucket|not found|storage/i.test(message) ? 503 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
