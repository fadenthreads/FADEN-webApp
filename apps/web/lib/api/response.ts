import { NextResponse } from "next/server";

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function okResponse(data?: Record<string, unknown>) {
  return NextResponse.json({ ok: true, ...data });
}
