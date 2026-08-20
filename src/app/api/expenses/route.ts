import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized, assertTrustedJsonRequest } from "@/shared/presentation/api-response";

export async function POST(request: Request) {
  const session = await requireApiSession(request.headers);
  if (!session) return apiUnauthorized();
  try {
    assertTrustedJsonRequest(request);
    const id = await businessService.createExpense(await request.json(), session.user.id);
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
