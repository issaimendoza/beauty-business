import { PageHeader } from "@/components/page-header";
import { businessService } from "@/shared/infrastructure/composition/business";
import { InsightsDashboard } from "./insights-dashboard";

export default async function InsightsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [staff, servicePage, auxiliaries] = await Promise.all([
    businessService.listStaff(),
    businessService.listServices({ limit: 50 }),
    businessService.listAuxiliaries(),
  ]);
  const single = (key: string) => typeof params[key] === "string" ? params[key] as string : undefined;
  return <div className="space-y-7"><PageHeader eyebrow="Reportes" title="Insights" description="Explora ingresos, egresos, pagos a colaboradoras, oportunidades perdidas y resultado preliminar con comparación contra el periodo anterior." /><InsightsDashboard initial={{ period: single("period"), granularity: single("granularity"), startDate: single("startDate"), endDate: single("endDate"), professionalId: single("professionalId"), serviceId: single("serviceId"), serviceCategory: single("serviceCategory"), paymentMethod: single("paymentMethod"), paymentReceiver: single("paymentReceiver"), source: single("source"), customerKind: single("customerKind"), expenseCategoryId: single("expenseCategoryId"), productId: single("productId"), vendorId: single("vendorId"), lostReason: single("lostReason"), priceAdjustmentReason: single("priceAdjustmentReason"), splitAdjustmentReason: single("splitAdjustmentReason"), compare: single("compare") }} staff={staff.map((item) => ({ id: item.id, name: item.name }))} services={servicePage.items.map((item) => ({ id: item.id, name: item.name }))} serviceCategories={[...new Set(servicePage.items.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "es"))} auxiliaries={auxiliaries} /></div>;
}
