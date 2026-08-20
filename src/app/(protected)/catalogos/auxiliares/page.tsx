import { PageHeader } from "@/components/page-header";
import { businessService } from "@/shared/infrastructure/composition/business";
import { AuxiliaryCatalogs } from "./auxiliary-catalogs";

export default async function AuxiliariesPage() {
  const data = await businessService.listAuxiliaries();
  return <div className="space-y-7"><PageHeader eyebrow="Catálogos" title="Productos, proveedores y categorías" description="Mantén consistentes los datos usados al registrar gastos y compras." /><AuxiliaryCatalogs initialData={data} /></div>;
}
