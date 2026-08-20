import { PageHeader } from "@/components/page-header";
import { businessService } from "@/shared/infrastructure/composition/business";
import { VisitForm } from "./visit-form";

export default async function RegisterVisitPage() {
  const staff = await businessService.listStaff();
  return <div className="space-y-7"><PageHeader eyebrow="Operación" title="Registrar servicio realizado" description="Agrega uno o varios servicios, revisa las sugerencias y deja registrado por qué cambió un precio o reparto. La decisión final siempre es del equipo." /><VisitForm staff={staff} /></div>;
}
