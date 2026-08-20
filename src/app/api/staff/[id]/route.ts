import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized, assertTrustedJsonRequest } from "@/shared/presentation/api-response";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    assertTrustedJsonRequest(request);
    const { id } = await context.params;
    await businessService.updateStaff(id, await request.json());
    return NextResponse.json({ data: { id } });
  } catch (error) {
    return apiError(error);
  }
}
