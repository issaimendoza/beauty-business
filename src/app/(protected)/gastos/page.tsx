import { PageHeader } from "@/components/page-header";
import { businessService } from "@/shared/infrastructure/composition/business";
import { ExpenseForm } from "./expense-form";

export default async function ExpensesPage() { const auxiliary = await businessService.listAuxiliaries(); return <div className="space-y-7"><PageHeader eyebrow="Finanzas" title="Registrar gasto o compra" description="Captura salidas de dinero con su categoría, proveedor y producto para mantener los reportes trazables." /><ExpenseForm auxiliary={auxiliary} /></div>; }
