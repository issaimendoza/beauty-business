import { NextResponse } from "next/server";

import { requireApiSession } from "@/shared/infrastructure/auth/session";
import { businessService } from "@/shared/infrastructure/composition/business";
import { apiError, apiUnauthorized } from "@/shared/presentation/api-response";

export async function GET(request: Request) {
  if (!(await requireApiSession(request.headers))) return apiUnauthorized();
  try {
    const params = new URL(request.url).searchParams;
    const data = await businessService.getInsights({
      period: params.get("period") ?? "month",
      startDate: params.get("startDate") ?? undefined,
      endDate: params.get("endDate") ?? undefined,
      professionalId: params.get("professionalId") ?? undefined,
      serviceId: params.get("serviceId") ?? undefined,
      serviceCategory: params.get("serviceCategory") ?? undefined,
      paymentMethod: params.get("paymentMethod") ?? undefined,
      paymentReceiver: params.get("paymentReceiver") ?? undefined,
      source: params.get("source") ?? undefined,
      customerKind: params.get("customerKind") ?? undefined,
      expenseCategoryId: params.get("expenseCategoryId") ?? undefined,
      productId: params.get("productId") ?? undefined,
      vendorId: params.get("vendorId") ?? undefined,
      lostReason: params.get("lostReason") ?? undefined,
      priceAdjustmentReason: params.get("priceAdjustmentReason") ?? undefined,
      splitAdjustmentReason: params.get("splitAdjustmentReason") ?? undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
