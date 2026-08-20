import { PageHeader } from "@/components/page-header";
import { businessService } from "@/shared/infrastructure/composition/business";
import { StaffCatalog } from "./staff-catalog";

export default async function StaffPage() {
  const staff = await businessService.listStaff(true);
  return <div className="space-y-7"><PageHeader eyebrow="Catálogos" title="Colaboradoras" description="Define quién presta servicios y el acuerdo vigente que se usará como sugerencia. Los montos finales siguen bajo decisión del equipo." /><StaffCatalog initialStaff={staff} /></div>;
}
