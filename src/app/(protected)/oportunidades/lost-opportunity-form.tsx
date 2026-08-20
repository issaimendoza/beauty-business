"use client";

import { BriefcaseBusiness, CalendarClock, CircleDollarSign, LoaderCircle, Save } from "lucide-react";
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

type ServiceOption = { id: string; name: string };

function now() { const date = new Date(); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16); }

export function LostOpportunityForm({ services }: { services: ServiceOption[] }) {
  const [pending, setPending] = useState(false);
  const [serviceId, setServiceId] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const form = event.currentTarget; const data = new FormData(form);
    const selected = services.find((item) => item.id === serviceId);
    const customService = String(data.get("customService") ?? "").trim();
    if (!selected && customService.length < 2) { setPending(false); return toast.error("Selecciona o escribe el servicio solicitado."); }
    try {
      await requestJson("/api/lost-opportunities", jsonPost({
        occurredAt: data.get("occurredAt"), requestedAt: data.get("requestedAt") || undefined,
        requestedServiceId: selected?.id, requestedServiceSnapshot: selected?.name ?? customService,
        estimatedAmountMinor: data.get("estimated") ? Math.round(Number(data.get("estimated")) * 100) : undefined,
        reason: data.get("reason"), channel: data.get("channel") || undefined,
        customerKind: data.get("customerKind"), source: data.get("source") || undefined,
        detail: data.get("detail") || undefined,
      }));
      toast.success("Oportunidad registrada"); form.reset(); setServiceId("");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos guardar la oportunidad."); }
    finally { setPending(false); }
  }

  return <Card><CardHeader><CardTitle className="flex items-center gap-2"><BriefcaseBusiness className="text-primary" />Detalle de la solicitud</CardTitle></CardHeader><CardContent>
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Field label="Fecha del registro"><Input name="occurredAt" type="datetime-local" defaultValue={now()} required /></Field>
      <Field label="Fecha solicitada" tip="Es opcional; permite analizar días y horarios con demanda no atendida."><div className="relative"><CalendarClock className="absolute left-3 top-3.5 size-4 text-primary" /><Input name="requestedAt" type="datetime-local" className="pl-10" /></div></Field>
      <Field label="Servicio del catálogo"><Select value={serviceId} onChange={(event) => setServiceId(event.target.value)}><option value="">No está en catálogo</option>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>
      {!serviceId ? <Field label="Servicio solicitado" tip="Puedes registrar demanda de un servicio que todavía no exista en el catálogo."><Input name="customService" required /></Field> : null}
      <Field label="Monto estimado"><div className="relative"><CircleDollarSign className="absolute left-3 top-3.5 size-4 text-primary" /><Input name="estimated" type="number" min="0" step="0.01" className="pl-10" /></div></Field>
      <Field label="Motivo"><Select name="reason" defaultValue="no_availability"><option value="no_availability">Sin disponibilidad</option><option value="service_unavailable">Servicio no disponible</option><option value="price">Precio</option><option value="client_cancelled">Cliente canceló</option><option value="no_show">No se presentó</option><option value="no_response">No respondió</option><option value="schedule">Horario incompatible</option><option value="other">Otro</option></Select></Field>
      <Field label="Canal"><Select name="channel" defaultValue=""><option value="">No indicado</option><option value="whatsapp">WhatsApp</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="phone">Llamada</option><option value="walk_in">Visita al local</option><option value="other">Otro</option></Select></Field>
      <Field label="Tipo de cliente"><Select name="customerKind" defaultValue="unspecified"><option value="new">Nuevo</option><option value="returning">Recurrente</option><option value="unspecified">No indicado</option></Select></Field>
      <Field label="Origen de demanda"><Select name="source" defaultValue="unknown"><option value="salon">Salón</option><option value="professional">Colaboradora</option><option value="unknown">Desconocido</option></Select></Field>
      <div className="md:col-span-2"><Field label="Detalle"><Textarea name="detail" /></Field></div>
      <div className="lg:col-span-3 flex justify-end"><Button size="lg" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Save />}{pending ? "Guardando…" : "Registrar oportunidad"}</Button></div>
    </form>
  </CardContent></Card>;
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) { return <div className="space-y-2"><div className="flex items-center gap-1"><Label>{label}</Label>{tip ? <InfoTip>{tip}</InfoTip> : null}</div>{children}</div>; }
