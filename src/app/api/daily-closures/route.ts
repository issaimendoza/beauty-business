import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized, assertTrustedJsonRequest } from "@/shared/presentation/api-response";

export async function GET(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    const date = new URL(request.url).searchParams.get("date") ?? "";
    return NextResponse.json({ data: await businessService.getDayPreview(date) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const session = await requireApiSession(request.headers);
  if (!session) return apiUnauthorized();
  try {
    assertTrustedJsonRequest(request);
    const data = await businessService.closeDay(await request.json(), session.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
