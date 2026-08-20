import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized, assertTrustedJsonRequest } from "@/shared/presentation/api-response";

export async function POST(request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    assertTrustedJsonRequest(request);
    const { type, id } = await params;
    await businessService.toggleAuxiliary(type, id);
    return NextResponse.json({ data: { id } });
  } catch (error) { return apiError(error); }
}
