import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized } from "@/shared/presentation/api-response";

export async function GET(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    const params = new URL(request.url).searchParams;
    const data = await businessService.getSettlementSuggestion(params.get("serviceId") ?? "", params.get("professionalId") ?? "");
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
