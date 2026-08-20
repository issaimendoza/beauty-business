import { PageHeader } from "@/components/page-header";
import { ServicesCatalog } from "./services-catalog";

export default function ServicesPage() {
  return <div className="space-y-7"><PageHeader eyebrow="Catálogos" title="Servicios" description="Busca con autocompletado remoto y recorre el catálogo mediante cursor, sin degradar conforme crezca la información." /><ServicesCatalog /></div>;
}
