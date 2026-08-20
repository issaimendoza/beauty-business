"use client";

import { CirclePower, Clock3, LoaderCircle, Pencil, Plus, Save, Search, Scissors } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CursorPage, ServiceView } from "@/modules/business/application/contracts";
import { formatMoney } from "@/shared/domain/money";
import { jsonPost, jsonPut, requestJson } from "@/shared/presentation/http";

export function ServicesCatalog() {
  const [items, setItems] = useState<ServiceView[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [pendingCatalog, setPendingCatalog] = useState<Array<{lineId:string;name:string;category:string|null;occurredAt:string}>>([]);
  const requestId = useRef(0);

  const load = useCallback(async (search: string, next?: string, append = false) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: search, limit: "20", all: "true" });
      if (next) params.set("cursor", next);
      const page = await requestJson<CursorPage<ServiceView>>(`/api/services?${params}`);
      if (currentRequest !== requestId.current) return;
      setItems((current) => append ? [...new Map([...current, ...page.items].map((item) => [item.id, item])).values()] : page.items);
      setCursor(page.nextCursor);
    } catch (error) { if (currentRequest === requestId.current) toast.error(error instanceof Error ? error.message : "No pudimos buscar."); }
    finally { if (currentRequest === requestId.current) setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => load(query), 280); return () => window.clearTimeout(timer); }, [query, load]);
  useEffect(() => { const timer=window.setTimeout(async()=>{ try { setPendingCatalog(await requestJson("/api/services/pending")); } catch { /* the main catalog still remains usable */ } },0); return()=>window.clearTimeout(timer); },[]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await requestJson("/api/services", jsonPost({ name: data.get("name"), category: data.get("category"), description: data.get("description") || undefined, listPriceMinor: Math.round(Number(data.get("price")) * 100), durationMinutes: Number(data.get("durationMinutes")) }));
      toast.success("Servicio registrado"); form.reset(); setOpen(false); await load(query);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos guardar."); }
    finally { setPending(false); }
  }

  async function toggle(id: string) { try { await requestJson(`/api/services/${id}/toggle`, jsonPost({})); toast.success("Estado actualizado"); await load(query); } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos actualizar."); } }

  async function edit(event: React.FormEvent<HTMLFormElement>, id: string) { event.preventDefault(); setPending(true); const data = new FormData(event.currentTarget); try { await requestJson(`/api/services/${id}`, jsonPut({ name: data.get("name"), category: data.get("category"), description: data.get("description") || undefined, listPriceMinor: Math.round(Number(data.get("price")) * 100), durationMinutes: Number(data.get("durationMinutes")) })); toast.success("Servicio actualizado sin alterar visitas históricas"); setEditingId(undefined); await load(query); } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos actualizar."); } finally { setPending(false); } }
  async function completePending(event:React.FormEvent<HTMLFormElement>,lineId:string){event.preventDefault();setPending(true);const data=new FormData(event.currentTarget);try{await requestJson("/api/services/pending",jsonPost({lineId,name:data.get("name"),category:data.get("category"),description:data.get("description")||undefined,listPriceMinor:Math.round(Number(data.get("price"))*100),durationMinutes:Number(data.get("durationMinutes"))}));toast.success("Ficha completada y vinculada con la visita histórica");setPendingCatalog((current)=>current.filter((item)=>item.lineId!==lineId));await load(query);}catch(error){toast.error(error instanceof Error?error.message:"No pudimos completar la ficha.");}finally{setPending(false);}}

  return <div className="space-y-5">
    {pendingCatalog.length ? <Card className="border-amber-200 bg-amber-50/50"><CardHeader><CardTitle>Servicios pendientes de completar</CardTitle><p className="text-sm text-muted-foreground">Se registraron durante una visita sin interrumpir el flujo. Completa ahora su ficha de catálogo.</p></CardHeader><CardContent className="space-y-3">{pendingCatalog.map((item)=><form key={item.lineId} onSubmit={(event)=>completePending(event,item.lineId)} className="grid gap-2 rounded-xl border bg-background p-3 md:grid-cols-5"><Input name="name" defaultValue={item.name} required/><Input name="category" defaultValue={item.category??""} placeholder="Categoría" required/><Input name="price" type="number" min="0" step="0.01" placeholder="Precio de lista" required/><Input name="durationMinutes" type="number" min="5" defaultValue="60" required/><Button disabled={pending}>{pending?<LoaderCircle className="animate-spin"/>:<Save/>} Completar</Button><Input name="description" className="md:col-span-5" placeholder="Descripción opcional"/></form>)}</CardContent></Card>:null}
    <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre…" className="pl-10" aria-label="Buscar servicios" />{loading ? <LoaderCircle className="absolute right-3 top-3.5 size-4 animate-spin text-primary" /> : null}</div><Button onClick={() => setOpen((value) => !value)}><Plus /> Nuevo servicio</Button></div>
    {open ? <Card className="animate-in fade-in slide-in-from-top-2"><CardHeader><CardTitle className="flex items-center gap-2"><Scissors className="text-primary" /> Alta de servicio</CardTitle></CardHeader><CardContent><form onSubmit={create} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Field label="Nombre"><Input aria-label="Nombre del servicio" name="name" required /></Field><Field label="Categoría"><Input aria-label="Categoría del servicio" name="category" required /></Field><Field label="Precio de lista" tip="Se usa como sugerencia al registrar una sesión; puede ajustarse con una razón."><Input aria-label="Precio de lista" name="price" type="number" min="0" step="0.01" required /></Field><Field label="Duración (min)"><Input aria-label="Duración estimada" name="durationMinutes" type="number" min="5" step="5" defaultValue="60" required /></Field><div className="md:col-span-2 lg:col-span-4"><Field label="Descripción"><Input aria-label="Descripción del servicio" name="description" /></Field></div><div className="lg:col-span-4 flex justify-end"><Button disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Plus />} Guardar servicio</Button></div></form></CardContent></Card> : null}
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((service) => <Card key={service.id} className={!service.active ? "opacity-60" : ""}><CardHeader><div className="flex items-start justify-between"><div><CardTitle>{service.name}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{service.category}</p></div><span className="font-semibold text-primary">{formatMoney(service.listPriceMinor)}</span></div></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" /> {service.durationMinutes} min</span><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditingId(editingId === service.id ? undefined : service.id)}><Pencil /> Editar</Button><Button variant="outline" size="sm" onClick={() => toggle(service.id)}><CirclePower /> {service.active ? "Desactivar" : "Reactivar"}</Button></div></div>{service.description ? <p className="text-sm text-muted-foreground">{service.description}</p> : null}{editingId === service.id ? <form onSubmit={(event) => edit(event, service.id)} className="animate-in space-y-3 rounded-xl border bg-muted/25 p-3"><Input name="name" defaultValue={service.name} required /><Input name="category" defaultValue={service.category} required /><Input name="description" defaultValue={service.description ?? ""} placeholder="Descripción" /><Input name="price" type="number" min="0" step="0.01" defaultValue={(service.listPriceMinor/100).toFixed(2)} required /><Input name="durationMinutes" type="number" min="5" defaultValue={service.durationMinutes} required /><Button disabled={pending} className="w-full">{pending ? <LoaderCircle className="animate-spin" /> : <Save />} Guardar cambios</Button></form> : null}</CardContent></Card>)}</div>
    {!loading && items.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No encontramos servicios. Puedes registrarlo aquí o desde una sesión.</div> : null}
    {cursor ? <div className="flex justify-center"><Button variant="outline" disabled={loading} onClick={() => load(query, cursor, true)}>{loading ? <LoaderCircle className="animate-spin" /> : <Plus />} Cargar más</Button></div> : null}
  </div>;
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) { return <div className="space-y-2"><div className="flex items-center gap-1"><Label>{label}</Label>{tip ? <InfoTip>{tip}</InfoTip> : null}</div>{children}</div>; }
