import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized, assertTrustedJsonRequest } from "@/shared/presentation/api-response";

export async function GET(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  return NextResponse.json({ data: await businessService.listAuxiliaries() });
}

export async function POST(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    assertTrustedJsonRequest(request);
    const id = await businessService.createAuxiliary(await request.json());
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
