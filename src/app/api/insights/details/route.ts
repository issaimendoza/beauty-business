import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized } from "@/shared/presentation/api-response";

export async function GET(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    const params = new URL(request.url).searchParams;
    const value = (key: string) => params.get(key) ?? undefined;
    const data = await businessService.getInsightDetails({
      kind: value("kind"), cursor: value("cursor"), limit: params.has("limit") ? Number(params.get("limit")) : undefined,
      period: value("period") ?? "month", startDate: value("startDate"), endDate: value("endDate"), professionalId: value("professionalId"),
      serviceId: value("serviceId"), serviceCategory: value("serviceCategory"), paymentMethod: value("paymentMethod"), paymentReceiver: value("paymentReceiver"),
      source: value("source"), customerKind: value("customerKind"), expenseCategoryId: value("expenseCategoryId"), productId: value("productId"),
      vendorId: value("vendorId"), lostReason: value("lostReason"), priceAdjustmentReason: value("priceAdjustmentReason"), splitAdjustmentReason: value("splitAdjustmentReason"),
    });
    return NextResponse.json({ data });
  } catch (error) { return apiError(error); }
}
