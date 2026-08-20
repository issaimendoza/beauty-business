"use client";

import { BadgePercent, CirclePower, LoaderCircle, Pencil, Plus, Save, UserRoundPlus, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { StaffAgreementView } from "@/modules/business/application/contracts";
import { jsonPost, jsonPut, requestJson } from "@/shared/presentation/http";
import { cn } from "@/shared/presentation/cn";

export function StaffCatalog({ initialStaff }: { initialStaff: StaffAgreementView[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(initialStaff.length === 0);
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string>();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await requestJson("/api/staff", jsonPost(Object.fromEntries(data)));
      toast.success("Colaboradora registrada");
      form.reset(); setOpen(false); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos guardar."); }
    finally { setPending(false); }
  }

  async function toggle(id: string) {
    try { await requestJson(`/api/staff/${id}/toggle`, jsonPost({})); router.refresh(); toast.success("Estado actualizado"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos actualizar."); }
  }

  async function edit(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); setPending(true); const data = new FormData(event.currentTarget);
    try { await requestJson(`/api/staff/${id}`, jsonPut(Object.fromEntries(data))); toast.success("Colaboradora actualizada; el acuerdo anterior quedó en el historial"); setEditingId(undefined); router.refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos actualizar."); }
    finally { setPending(false); }
  }

  return <div className="space-y-5">
    <div className="flex justify-end"><Button onClick={() => setOpen((value) => !value)} variant={open ? "outline" : "default"}><Plus /> {open ? "Cerrar formulario" : "Nueva colaboradora"}</Button></div>
    {open ? <Card className="animate-in fade-in slide-in-from-top-2"><CardHeader><CardTitle className="flex items-center gap-2"><UserRoundPlus className="text-primary" /> Datos y acuerdo inicial</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Field label="Nombre" tip="Nombre que aparecerá al registrar servicios."><Input name="name" required minLength={2} /></Field>
      <Field label="Tipo"><Select name="kind" defaultValue="professional"><option value="professional">Profesional</option><option value="employee">Empleada</option><option value="owner">Propietaria</option><option value="other">Otro</option></Select></Field>
      <Field label="Especialidad"><Input name="specialty" placeholder="Uñas, cabello…" /></Field>
      <Field label="Teléfono"><Input name="phone" type="tel" /></Field>
      <Field label="Acuerdo" tip="Define la sugerencia. El reparto final puede cambiarse en cada servicio con una explicación."><Select name="agreementKind" defaultValue="percentage"><option value="percentage">Porcentaje</option><option value="employee">Empleada</option><option value="owner">Propietaria</option><option value="manual">Manual</option></Select></Field>
      <Field label="Porcentaje del salón" tip="El resto se sugerirá para la colaboradora."><div className="relative"><Input name="salonSharePercent" type="number" min="0" max="100" step="0.01" defaultValue="50" className="pr-10" /><BadgePercent className="absolute right-3 top-3 size-4 text-muted-foreground" /></div></Field>
      <Field label="Materiales"><Select name="materialsOwner" defaultValue="professional"><option value="professional">Colaboradora</option><option value="salon">Salón</option><option value="shared">Compartidos</option></Select></Field>
      <Field label="Herramientas"><Select name="toolsOwner" defaultValue="professional"><option value="professional">Colaboradora</option><option value="salon">Salón</option><option value="shared">Compartidas</option></Select></Field>
      <Field label="Vigente desde"><Input name="effectiveFrom" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
      <div className="md:col-span-2"><Field label="Notas"><Textarea name="notes" /></Field></div>
      <div className="flex items-end"><Button disabled={pending} className="w-full">{pending ? <LoaderCircle className="animate-spin" /> : <UserRoundPlus />} {pending ? "Guardando…" : "Guardar colaboradora"}</Button></div>
    </form></CardContent></Card> : null}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{initialStaff.map((person) => <Card key={person.id} className={cn("transition-all hover:-translate-y-0.5 hover:shadow-md", !person.active && "opacity-60")}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{person.name}</CardTitle><p className="mt-1 text-xs capitalize text-muted-foreground">{person.specialty || person.kind}</p></div><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", person.active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground")}>{person.active ? "Activa" : "Inactiva"}</span></div></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex items-center gap-2"><BadgePercent className="size-4 text-primary" /><span>Salón {(person.salonShareBps ?? 0) / 100}% · Colaboradora {(person.professionalShareBps ?? 0) / 100}%</span></div><p className="text-xs text-muted-foreground">Vigente desde {person.agreementEffectiveFrom ? new Date(person.agreementEffectiveFrom).toLocaleDateString("es-MX") : "sin fecha"}</p><div className="flex items-center gap-2 text-muted-foreground"><Wrench className="size-4" /><span>Materiales: {person.materialsOwner} · Herramientas: {person.toolsOwner}</span></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setEditingId(editingId === person.id ? undefined : person.id)}><Pencil /> Editar</Button><Button variant="outline" size="sm" onClick={() => toggle(person.id)}><CirclePower /> {person.active ? "Desactivar" : "Reactivar"}</Button></div>{editingId === person.id ? <form onSubmit={(event) => edit(event, person.id)} className="animate-in space-y-3 rounded-xl border bg-muted/25 p-3"><Input name="name" defaultValue={person.name} required /><Input name="specialty" defaultValue={person.specialty ?? ""} placeholder="Especialidad" /><Input name="phone" defaultValue={person.phone ?? ""} placeholder="Teléfono" /><Select name="kind" defaultValue={person.kind}><option value="professional">Profesional</option><option value="employee">Empleada</option><option value="owner">Propietaria</option><option value="other">Otro</option></Select><Select name="agreementKind" defaultValue={person.agreementKind ?? "percentage"}><option value="percentage">Porcentaje</option><option value="employee">Empleada</option><option value="owner">Propietaria</option><option value="manual">Manual</option></Select><Input name="salonSharePercent" type="number" min="0" max="100" step="0.01" defaultValue={(person.salonShareBps ?? 0) / 100} required /><Select name="materialsOwner" defaultValue={person.materialsOwner}><option value="professional">Materiales de colaboradora</option><option value="salon">Materiales del salón</option><option value="shared">Materiales compartidos</option></Select><Select name="toolsOwner" defaultValue={person.toolsOwner}><option value="professional">Herramientas de colaboradora</option><option value="salon">Herramientas del salón</option><option value="shared">Herramientas compartidas</option></Select><Input name="effectiveFrom" type="date" defaultValue={new Date().toISOString().slice(0,10)} required /><Textarea name="notes" defaultValue={person.notes ?? ""} /><Button disabled={pending} className="w-full">{pending ? <LoaderCircle className="animate-spin" /> : <Save />} Guardar cambios</Button></form> : null}</CardContent></Card>)}</div>
    {initialStaff.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Aún no hay colaboradoras. Registra la primera para comenzar.</div> : null}
  </div>;
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="flex items-center gap-1"><Label>{label}</Label>{tip ? <InfoTip>{tip}</InfoTip> : null}</div>{children}</div>;
}
