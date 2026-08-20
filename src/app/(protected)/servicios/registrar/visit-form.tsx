"use client";

import { BookPlus, CircleDollarSign, Clock3, LoaderCircle, Plus, Save, Scissors, Search, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CursorPage, ServiceView, StaffAgreementView } from "@/modules/business/application/contracts";
import { jsonPost, requestJson } from "@/shared/presentation/http";

type VisitLine = {
  key: number;
  serviceId: string;
  adHocServiceName: string;
  adHocCategory: string;
  professionalId: string;
  suggestedPriceMinor?: number;
  suggestedSalonMinor?: number;
  suggestedProfessionalMinor?: number;
  finalPrice: string;
  finalSalon: string;
  finalProfessional: string;
  priceAdjustmentReason: string;
  priceAdjustmentDetail: string;
  splitAdjustmentReason: string;
  splitAdjustmentDetail: string;
  startedAt: string;
  completedAt: string;
};

function emptyLine(key: number): VisitLine {
  return { key, serviceId: "", adHocServiceName: "", adHocCategory: "", professionalId: "", finalPrice: "", finalSalon: "", finalProfessional: "", priceAdjustmentReason: "", priceAdjustmentDetail: "", splitAdjustmentReason: "", splitAdjustmentDetail: "", startedAt: "", completedAt: "" };
}

function localDateTime() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function VisitForm({ staff }: { staff: StaffAgreementView[] }) {
  const [lines, setLines] = useState<VisitLine[]>([emptyLine(1)]);
  const [pending, setPending] = useState(false);
  const nextKey = useRef(2);

  function updateLine(key: number, patch: Partial<VisitLine>) {
    setLines((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line));
  }

  function updateFinalPrice(line: VisitLine, value: string) {
    const professional = staff.find((person) => person.id === line.professionalId);
    const finalMinor = Math.round(Number(value) * 100);
    if (!professional || !Number.isFinite(finalMinor)) {
      updateLine(line.key, { finalPrice: value });
      return;
    }
    const salonMinor = Math.round((finalMinor * (professional.salonShareBps ?? 0)) / 10_000);
    updateLine(line.key, {
      finalPrice: value,
      finalSalon: (salonMinor / 100).toFixed(2),
      finalProfessional: ((finalMinor - salonMinor) / 100).toFixed(2),
      suggestedSalonMinor: salonMinor,
      suggestedProfessionalMinor: finalMinor - salonMinor,
      splitAdjustmentReason: "",
      splitAdjustmentDetail: "",
    });
  }

  async function refreshSuggestion(line: VisitLine, patch: Partial<VisitLine>) {
    const next = { ...line, ...patch };
    updateLine(line.key, patch);
    if (!next.serviceId || !next.professionalId) return;
    try {
      const suggestion = await requestJson<{ priceMinor: number; salonMinor: number; professionalMinor: number }>(`/api/settlement-suggestion?serviceId=${next.serviceId}&professionalId=${next.professionalId}`);
      updateLine(line.key, {
        suggestedPriceMinor: suggestion.priceMinor,
        suggestedSalonMinor: suggestion.salonMinor,
        suggestedProfessionalMinor: suggestion.professionalMinor,
        finalPrice: (suggestion.priceMinor / 100).toFixed(2),
        finalSalon: (suggestion.salonMinor / 100).toFixed(2),
        finalProfessional: (suggestion.professionalMinor / 100).toFixed(2),
        priceAdjustmentReason: "",
        priceAdjustmentDetail: "",
        splitAdjustmentReason: "",
        splitAdjustmentDetail: "",
      });
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos calcular la sugerencia."); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const toMinor = (value: string) => Math.round(Number(value) * 100);
    try {
      await requestJson("/api/visits", jsonPost({
        occurredAt: data.get("occurredAt"), customerName: data.get("customerName") || undefined,
        customerKind: data.get("customerKind"), source: data.get("source") || undefined,
        paymentMethod: data.get("paymentMethod"), paymentReceiver: data.get("paymentReceiver"), receivedByStaffId: data.get("receivedByStaffId") || undefined,
        notes: data.get("notes") || undefined,
        lines: lines.map((line) => ({
          serviceId: line.serviceId || undefined,
          adHocServiceName: line.serviceId ? undefined : line.adHocServiceName,
          adHocCategory: line.serviceId ? undefined : line.adHocCategory,
          professionalId: line.professionalId,
          finalPriceMinor: toMinor(line.finalPrice), finalSalonMinor: toMinor(line.finalSalon), finalProfessionalMinor: toMinor(line.finalProfessional),
          priceAdjustmentReason: line.priceAdjustmentReason ? (line.priceAdjustmentReason === "other" ? `other:${line.priceAdjustmentDetail}` : line.priceAdjustmentReason) : undefined,
          splitAdjustmentReason: line.splitAdjustmentReason ? (line.splitAdjustmentReason === "other" ? `other:${line.splitAdjustmentDetail}` : line.splitAdjustmentReason) : undefined,
          startedAt: line.startedAt || undefined, completedAt: line.completedAt || undefined,
        })),
      }));
      toast.success("Servicio realizado registrado");
      form.reset(); setLines([emptyLine(nextKey.current++)]);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos registrar el servicio.", { duration: 7000 }); }
    finally { setPending(false); }
  }

  if (staff.length === 0) return <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-8 text-center"><UserRound className="mx-auto mb-3 text-primary" /><p className="font-medium">Primero registra una colaboradora y su acuerdo.</p></div>;

  return <form onSubmit={submit} className="space-y-5">
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock3 className="text-primary" /> Datos de la visita</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Field label="Fecha y hora"><Input name="occurredAt" type="datetime-local" defaultValue={localDateTime()} required /></Field>
      <Field label="Cliente"><Input name="customerName" placeholder="Opcional" /></Field>
      <Field label="Tipo de cliente"><Select name="customerKind" defaultValue="unspecified"><option value="unspecified">Sin especificar</option><option value="new">Nuevo</option><option value="returning">Recurrente</option></Select></Field>
      <Field label="Origen de demanda"><Select name="source" defaultValue="unknown"><option value="salon">Salón</option><option value="professional">Colaboradora</option><option value="unknown">Desconocido</option></Select></Field>
      <Field label="Método de pago"><Select name="paymentMethod" defaultValue="cash"><option value="cash">Efectivo</option><option value="card">Tarjeta</option><option value="transfer">Transferencia</option><option value="other">Otro</option></Select></Field>
      <Field label="Receptor inicial" tip="Quién recibió el pago no cambia a quién pertenece económicamente."><Select name="paymentReceiver" defaultValue="salon"><option value="salon">Salón</option><option value="professional">Colaboradora</option><option value="unknown">Desconocido</option></Select></Field>
      <Field label="Quién recibió"><Select name="receivedByStaffId" defaultValue=""><option value="">Sin especificar</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</Select></Field>
      <div className="md:col-span-2"><Field label="Notas"><Input name="notes" /></Field></div>
    </CardContent></Card>
    <div className="space-y-4">{lines.map((line, index) => <Card key={line.key} className="animate-in fade-in slide-in-from-bottom-2"><CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Scissors className="text-primary" /> Servicio {index + 1}</CardTitle>{lines.length > 1 ? <Button type="button" variant="ghost" size="sm" onClick={() => setLines((current) => current.filter((item) => item.key !== line.key))}><Trash2 /> Quitar</Button> : null}</div></CardHeader><CardContent className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2"><ServiceAutocomplete value={line.serviceId} adHocName={line.adHocServiceName} onSelect={(service) => refreshSuggestion(line, service ? { serviceId: service.id, adHocServiceName: "", adHocCategory: "" } : { serviceId: "" })} onAdHoc={(value) => updateLine(line.key, { serviceId: "", adHocServiceName: value, suggestedPriceMinor: undefined })} /><Field label="Colaboradora" tip="Su acuerdo vigente se usa únicamente para calcular la sugerencia."><Select value={line.professionalId} onChange={(event) => refreshSuggestion(line, { professionalId: event.target.value })} required><option value="">Selecciona…</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.name} · salón {(person.salonShareBps ?? 0) / 100}%</option>)}</Select></Field></div>
      {!line.serviceId ? <div className="grid gap-4 rounded-xl border border-dashed bg-muted/30 p-4 md:grid-cols-2"><Field label="Nombre temporal" tip="Se registra en la visita y queda marcado para completar el catálogo después."><Input value={line.adHocServiceName} onChange={(event) => updateLine(line.key, { adHocServiceName: event.target.value })} required /></Field><Field label="Categoría temporal"><Input value={line.adHocCategory} onChange={(event) => updateLine(line.key, { adHocCategory: event.target.value })} /></Field></div> : null}
      <div className="grid gap-4 md:grid-cols-3"><MoneyField label="Precio final" value={line.finalPrice} onChange={(value) => updateFinalPrice(line, value)} suggestion={line.suggestedPriceMinor} /><MoneyField label="Para salón" value={line.finalSalon} onChange={(value) => updateLine(line.key, { finalSalon: value })} suggestion={line.suggestedSalonMinor} /><MoneyField label="Para colaboradora" value={line.finalProfessional} onChange={(value) => updateLine(line.key, { finalProfessional: value })} suggestion={line.suggestedProfessionalMinor} /></div>
      <div className="grid gap-4 md:grid-cols-2"><Field label="Hora inicial"><Input type="datetime-local" value={line.startedAt} onChange={(event) => updateLine(line.key, { startedAt: event.target.value })} /></Field><Field label="Hora final"><Input type="datetime-local" min={line.startedAt || undefined} value={line.completedAt} onChange={(event) => updateLine(line.key, { completedAt: event.target.value })} /></Field></div>
      <div className="grid gap-4 md:grid-cols-2"><Field label="Razón del cambio de precio" tip="Obligatoria si el precio final difiere del sugerido."><Select value={line.priceAdjustmentReason} onChange={(event) => updateLine(line.key, { priceAdjustmentReason: event.target.value })}><option value="">Sin ajuste</option><option value="promotion">Promoción</option><option value="negotiated_price">Precio negociado</option><option value="courtesy">Cortesía</option><option value="rework_or_complaint">Corrección o inconformidad</option><option value="extra_work_or_material">Trabajo o material adicional</option><option value="package">Paquete</option><option value="staff_or_family">Personal o familia</option><option value="other">Otro</option></Select>{line.priceAdjustmentReason === "other" ? <Input value={line.priceAdjustmentDetail} onChange={(event)=>updateLine(line.key,{priceAdjustmentDetail:event.target.value})} placeholder="Explica el motivo" required /> : null}</Field><Field label="Razón del cambio de reparto" tip="Obligatoria si cambia cualquiera de los importes sugeridos para salón o colaboradora."><Select value={line.splitAdjustmentReason} onChange={(event) => updateLine(line.key, { splitAdjustmentReason: event.target.value })}><option value="">Sin ajuste</option><option value="session_agreement">Acuerdo de esta sesión</option><option value="materials_or_tools">Materiales o herramientas</option><option value="rework_or_complaint">Corrección o inconformidad</option><option value="correction">Corrección de captura</option><option value="other">Otro</option></Select>{line.splitAdjustmentReason === "other" ? <Input value={line.splitAdjustmentDetail} onChange={(event)=>updateLine(line.key,{splitAdjustmentDetail:event.target.value})} placeholder="Explica el motivo" required /> : null}</Field></div>
    </CardContent></Card>)}</div>
    <div className="flex flex-col justify-between gap-3 sm:flex-row"><Button type="button" variant="outline" onClick={() => setLines((current) => [...current, emptyLine(nextKey.current++)])}><Plus /> Agregar otro servicio</Button><Button size="lg" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Save />} {pending ? "Registrando…" : "Finalizar registro"}</Button></div>
  </form>;
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) { return <div className="space-y-2"><div className="flex items-center gap-1"><Label>{label}</Label>{tip ? <InfoTip>{tip}</InfoTip> : null}</div>{children}</div>; }

function MoneyField({ label, value, onChange, suggestion }: { label: string; value: string; onChange: (value: string) => void; suggestion?: number }) { return <Field label={label} tip={suggestion === undefined ? "Escribe el importe acordado para este servicio temporal." : `Sugerencia: $${(suggestion / 100).toFixed(2)}. Puedes cambiarla.`}><div className="relative"><CircleDollarSign className="absolute left-3 top-3.5 size-4 text-primary" /><Input aria-label={label} className="pl-10" type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} required /></div></Field>; }

function ServiceAutocomplete({ value, adHocName, onSelect, onAdHoc }: { value: string; adHocName: string; onSelect: (service: ServiceView | null) => void; onAdHoc: (value: string) => void }) {
  const [query, setQuery] = useState(adHocName);
  const [items, setItems] = useState<ServiceView[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickCreate, setQuickCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [activeIndex, setActiveIndex] = useState(0);
  const requestId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLocaleLowerCase("es-MX");
  const priceMinor = Math.round(Number(price) * 100);
  const durationMinutes = Number(duration);
  const hasExactMatch = items.some((item) => item.normalizedName === normalizedQuery);
  const canCreate = trimmedQuery.length >= 2
    && category.trim().length >= 2
    && Number.isFinite(priceMinor)
    && priceMinor >= 0
    && Number.isInteger(durationMinutes)
    && durationMinutes >= 5;

  useEffect(() => {
    const current = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const page = await requestJson<CursorPage<ServiceView>>(`/api/services?q=${encodeURIComponent(query)}&limit=8`);
        if (current === requestId.current) {
          setItems(page.items);
          setCursor(page.nextCursor);
          setActiveIndex(0);
        }
      } catch (error) {
        if (current === requestId.current) {
          toast.error(error instanceof Error ? error.message : "No pudimos buscar servicios.");
          setItems([]);
          setCursor(null);
        }
      } finally {
        if (current === requestId.current) setLoading(false);
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  function choose(service: ServiceView) {
    setQuery(service.name);
    setOpen(false);
    setQuickCreate(false);
    onSelect(service);
  }

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    try {
      const page = await requestJson<CursorPage<ServiceView>>(`/api/services?q=${encodeURIComponent(query)}&limit=8&cursor=${encodeURIComponent(cursor)}`);
      setItems((current) => [...new Map([...current, ...page.items].map((item) => [item.id, item])).values()]);
      setCursor(page.nextCursor);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos cargar más.");
    } finally {
      setLoading(false);
    }
  }

  async function createService() {
    if (!canCreate) {
      toast.error("Completa la categoría, el precio y una duración mínima de 5 minutos.");
      return;
    }
    setCreating(true);
    try {
      const created = await requestJson<{ id: string }>("/api/services", jsonPost({
        name: trimmedQuery,
        category: category.trim(),
        listPriceMinor: priceMinor,
        durationMinutes,
      }));
      const service: ServiceView = {
        id: created.id,
        name: trimmedQuery,
        normalizedName: trimmedQuery.toLocaleLowerCase("es-MX"),
        category: category.trim(),
        normalizedCategory: category.trim().toLocaleLowerCase("es-MX"),
        description: null,
        listPriceMinor: priceMinor,
        durationMinutes,
        active: true,
      };
      choose(service);
      setCategory("");
      setPrice("");
      setDuration("60");
      toast.success("Servicio agregado y seleccionado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos agregar el servicio.");
    } finally {
      setCreating(false);
    }
  }

  return <Field label="Servicio" tip="Busca en el catálogo. Si no existe, agrégalo ahora o conserva el texto para completar su ficha después.">
    <div ref={containerRef} className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
        <Input
          role="combobox"
          aria-label="Servicio"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          className="pl-10 pr-10"
          value={query}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowDown" && items.length) {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % items.length);
            }
            if (event.key === "ArrowUp" && items.length) {
              event.preventDefault();
              setActiveIndex((current) => (current - 1 + items.length) % items.length);
            }
            if (event.key === "Enter" && open && items[activeIndex]) {
              event.preventDefault();
              choose(items[activeIndex]);
            }
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (!event.target.value.trim()) setQuickCreate(false);
            onAdHoc(event.target.value);
          }}
          placeholder="Buscar o escribir uno nuevo…"
          required
        />
        {loading ? <LoaderCircle aria-hidden="true" className="absolute right-3 top-3.5 size-4 animate-spin text-primary" /> : null}
        {open ? <div id={listboxId} role="listbox" className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border bg-background p-1 shadow-xl">
          {loading && items.length === 0 ? <p role="status" className="p-3 text-sm text-muted-foreground">Buscando servicios…</p> : null}
          {items.map((service, index) => <button
            key={service.id}
            role="option"
            aria-selected={value === service.id}
            type="button"
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-primary/8 ${activeIndex === index ? "bg-primary/8" : ""}`}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => choose(service)}
          >
            <span>{service.name}<small className="ml-2 text-muted-foreground">{service.category}</small></span>
            <span className="font-medium text-primary">${(service.listPriceMinor / 100).toFixed(2)}</span>
          </button>)}
          {!loading && items.length === 0 ? <p role="status" className="px-3 pt-3 text-sm text-muted-foreground">No encontramos servicios.</p> : null}
          {!value && trimmedQuery.length >= 2 && !hasExactMatch ? <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start"
            onClick={() => { setQuickCreate(true); setOpen(false); }}
          ><BookPlus /> Agregar &ldquo;{trimmedQuery}&rdquo; al catálogo</Button> : null}
          {cursor ? <Button type="button" variant="ghost" size="sm" className="w-full" onClick={loadMore}><Plus /> Cargar más</Button> : null}
        </div> : null}
      </div>
      {!value && trimmedQuery.length >= 2 && !quickCreate ? <p className="text-xs text-muted-foreground">Si continúas sin agregarlo al catálogo, quedará como servicio pendiente de completar.</p> : null}
      {quickCreate && !value ? <div className="animate-in space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-3 fade-in slide-in-from-top-2">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-sm font-medium">Agregar &ldquo;{trimmedQuery}&rdquo; al catálogo</p><p className="text-xs text-muted-foreground">Se guardará y quedará seleccionado en esta visita.</p></div>
          <Button type="button" variant="ghost" size="icon" aria-label="Cancelar alta de servicio" onClick={() => setQuickCreate(false)}><X /></Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Categoría del servicio"><Input aria-label="Categoría del servicio" value={category} onChange={(event) => setCategory(event.target.value)} required /></Field>
          <Field label="Precio de lista"><Input aria-label="Precio de lista" value={price} onChange={(event) => setPrice(event.target.value)} type="number" min="0" step="0.01" required /></Field>
          <Field label="Duración estimada"><Input aria-label="Duración estimada" value={duration} onChange={(event) => setDuration(event.target.value)} type="number" min="5" step="5" required /></Field>
        </div>
        <Button type="button" className="w-full" disabled={creating || !canCreate} onClick={createService}>{creating ? <LoaderCircle className="animate-spin" /> : <Save />} {creating ? "Guardando…" : "Guardar y seleccionar"}</Button>
      </div> : null}
    </div>
  </Field>;
}
