import { NextResponse } from "next/server";

import { businessService } from "@/shared/infrastructure/composition/business";
import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { apiError, apiUnauthorized, assertTrustedJsonRequest } from "@/shared/presentation/api-response";

export async function GET(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  return NextResponse.json({ data: await businessService.listStaff(new URL(request.url).searchParams.get("all") === "true") });
}

export async function POST(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    assertTrustedJsonRequest(request);
    const id = await businessService.createStaff(await request.json());
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
