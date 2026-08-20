"use client";

import { CircleDollarSign, FileText, LoaderCircle, Plus, ReceiptText, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { jsonPost, requestJson } from "@/shared/presentation/http";

type Item = { id: string; name: string; active: boolean };
type Auxiliary = { products: Item[]; vendors: Item[]; expenseCategories: Item[] };
type AuxiliaryType = "product" | "vendor" | "expenseCategory";

function now() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function ExpenseForm({ auxiliary }: { auxiliary: Auxiliary }) {
  const [catalogs, setCatalogs] = useState(auxiliary);
  const [kind, setKind] = useState<"purchase" | "operational">("operational");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [productId, setProductId] = useState("");
  const [pending, setPending] = useState(false);
  const [adding, setAdding] = useState<AuxiliaryType>();

  async function createAuxiliary(type: AuxiliaryType, value: string) {
    const name = value.trim();
    if (name.length < 2) { toast.error("Escribe un nombre de al menos dos caracteres."); return; }
    setAdding(type);
    try {
      const created = await requestJson<{ id: string }>("/api/auxiliaries", jsonPost({ type, name }));
      const item = { id: created.id, name, active: true };
      if (type === "product") { setCatalogs((current) => ({ ...current, products: [...current.products, item] })); setProductId(created.id); }
      if (type === "vendor") { setCatalogs((current) => ({ ...current, vendors: [...current.vendors, item] })); setVendorId(created.id); }
      if (type === "expenseCategory") { setCatalogs((current) => ({ ...current, expenseCategories: [...current.expenseCategories, item] })); setCategoryId(created.id); }
      toast.success("Elemento agregado y seleccionado");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos agregar el elemento."); }
    finally { setAdding(undefined); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await requestJson("/api/expenses", jsonPost({
        occurredAt: data.get("occurredAt"), kind, description: data.get("description"),
        amountMinor: Math.round(Number(data.get("amount")) * 100), paymentMethod: data.get("paymentMethod"),
        categoryId, vendorId: vendorId || undefined, productId: productId || undefined,
        quantity: data.get("quantity") ? Number(data.get("quantity")) : undefined,
        unit: data.get("unit") || undefined,
        unitCostMinor: data.get("unitCost") ? Math.round(Number(data.get("unitCost")) * 100) : undefined,
        receiptReference: data.get("receiptReference") || undefined,
        notes: data.get("notes") || undefined,
      }));
      toast.success(kind === "purchase" ? "Compra registrada" : "Gasto registrado");
      form.reset(); setKind("operational"); setCategoryId(""); setVendorId(""); setProductId("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos registrar el gasto."); }
    finally { setPending(false); }
  }

  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="text-primary" />Detalle del movimiento</CardTitle></CardHeader><CardContent>
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Field label="Tipo" tip="Compra identifica un producto o insumo; gasto operativo cubre las demás salidas."><Select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="operational">Gasto operativo</option><option value="purchase">Compra de producto o insumo</option></Select></Field>
      <Field label="Fecha y hora"><Input name="occurredAt" type="datetime-local" defaultValue={now()} required /></Field>
      <Field label="Descripción"><Input name="description" required /></Field>
      <Field label="Monto total" tip="Es la salida total de dinero y se guarda en centavos para evitar errores de redondeo."><MoneyInput name="amount" required /></Field>
      <Field label="Método de pago"><Select name="paymentMethod" defaultValue="cash"><option value="cash">Efectivo</option><option value="card">Tarjeta</option><option value="transfer">Transferencia</option><option value="other">Otro</option></Select></Field>
      <CatalogField label="Categoría" type="expenseCategory" value={categoryId} onChange={setCategoryId} items={catalogs.expenseCategories} adding={adding} onCreate={createAuxiliary} required />
      <CatalogField label="Proveedor" type="vendor" value={vendorId} onChange={setVendorId} items={catalogs.vendors} adding={adding} onCreate={createAuxiliary} />
      <CatalogField label="Producto" type="product" value={productId} onChange={setProductId} items={catalogs.products} adding={adding} onCreate={createAuxiliary} required={kind === "purchase"} />
      <Field label="Cantidad"><Input name="quantity" type="number" min="1" /></Field>
      <Field label="Unidad"><Input name="unit" placeholder="pieza, litro, caja…" /></Field>
      <Field label="Costo unitario"><MoneyInput name="unitCost" /></Field>
      <Field label="Comprobante" tip="Referencia, folio o enlace al comprobante; no almacena archivos en esta etapa."><div className="relative"><FileText className="absolute left-3 top-3.5 size-4 text-primary" /><Input name="receiptReference" className="pl-10" placeholder="Folio o enlace opcional" /></div></Field>
      <div className="md:col-span-2"><Field label="Notas"><Textarea name="notes" /></Field></div>
      <div className="lg:col-span-3 flex justify-end"><Button size="lg" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Save />}{pending ? "Guardando…" : "Registrar movimiento"}</Button></div>
    </form>
  </CardContent></Card>;
}

function MoneyInput({ name, required }: { name: string; required?: boolean }) { return <div className="relative"><CircleDollarSign className="absolute left-3 top-3.5 size-4 text-primary" /><Input name={name} type="number" min={required ? "0.01" : "0"} step="0.01" className="pl-10" required={required} /></div>; }

function CatalogField({ label, type, value, onChange, items, adding, onCreate, required }: { label: string; type: AuxiliaryType; value: string; onChange: (value: string) => void; items: Item[]; adding?: AuxiliaryType; onCreate: (type: AuxiliaryType, value: string) => Promise<void>; required?: boolean }) {
  const [newName, setNewName] = useState("");
  return <Field label={label} tip="Si no existe, agrégalo aquí; el resto de la captura se conserva."><Select value={value} onChange={(event) => onChange(event.target.value)} required={required}><option value="">{required ? "Selecciona…" : "Sin selección"}</option>{items.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select><div className="flex gap-2"><Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={`Nuevo ${label.toLocaleLowerCase("es-MX")}`} /><Button type="button" variant="outline" size="icon" aria-label={`Agregar ${label}`} disabled={adding === type} onClick={async () => { await onCreate(type, newName); setNewName(""); }}>{adding === type ? <LoaderCircle className="animate-spin" /> : <Plus />}</Button></div></Field>;
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) { return <div className="space-y-2"><div className="flex items-center gap-1"><Label>{label}</Label>{tip ? <InfoTip>{tip}</InfoTip> : null}</div>{children}</div>; }
