import { PageHeader } from "@/components/page-header";
import { businessService } from "@/shared/infrastructure/composition/business";
import { LostOpportunityForm } from "./lost-opportunity-form";

export default async function OpportunitiesPage() {
  const services = await businessService.listServices({ limit: 50 });
  return <div className="space-y-7"><PageHeader eyebrow="Operación" title="Oportunidades perdidas" description="Registra solicitudes que no se concretaron para identificar demanda, horarios y servicios que conviene revisar." /><LostOpportunityForm services={services.items.map((item) => ({ id: item.id, name: item.name }))} /></div>;
}
