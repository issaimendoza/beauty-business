import { PageHeader } from "@/components/page-header"; import { ClosureForm } from "./closure-form";
export default function ClosurePage(){return <div className="space-y-7"><PageHeader eyebrow="Operación" title="Cierre diario" description="Compara el efectivo esperado con el conteo físico y revisa alertas de registros posiblemente faltantes."/><ClosureForm/></div>}
