import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized, assertTrustedJsonRequest } from "@/shared/presentation/api-response";

export async function GET(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json({ data: await businessService.listServices({ query: params.get("q") ?? "", cursor: params.get("cursor") ?? undefined, limit: Number(params.get("limit") ?? 20), includeInactive: params.get("all") === "true" }) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    assertTrustedJsonRequest(request);
    const id = await businessService.createService(await request.json());
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
