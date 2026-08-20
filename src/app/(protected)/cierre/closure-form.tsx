"use client";

import { CalendarCheck2, CircleAlert, CircleCheck, LoaderCircle, LockKeyhole, Plus, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DailyClosePreview } from "@/modules/business/application/contracts";
import { formatMoney } from "@/shared/domain/money";
import { jsonPost, requestJson } from "@/shared/presentation/http";

type Result = { status: "balanced" | "difference" | "incomplete"; differenceMinor: number; warnings: string[] };

export function ClosureForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [businessDate, setBusinessDate] = useState(today);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<DailyClosePreview>();
  const [result, setResult] = useState<Result>();

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await requestJson<DailyClosePreview>(`/api/daily-closures?date=${businessDate}`);
        if (!cancelled) setPreview(data);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "No pudimos preparar el cierre.");
      }
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [businessDate]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await requestJson<Result>("/api/daily-closures", jsonPost({
        businessDate,
        physicalCashMinor: Math.round(Number(data.get("physicalCash")) * 100),
        hasMissingSales: data.get("hasMissingSales") === "on",
        hasMissingExpenses: data.get("hasMissingExpenses") === "on",
        notes: data.get("notes") || undefined,
      }));
      setResult(response); toast.success("Cierre guardado");
      setPreview(await requestJson<DailyClosePreview>(`/api/daily-closures?date=${businessDate}`));
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos cerrar el día."); }
    finally { setPending(false); }
  }

  return <div className="space-y-5">
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {preview ? [
        ["Venta bruta", preview.grossMinor], ["Ingreso del salón", preview.salonMinor], ["Efectivo esperado", preview.cashMinor],
        ["Transferencias", preview.transferMinor], ["Tarjetas", preview.cardMinor], ["Gastos", preview.expensesMinor],
      ].map(([label, value]) => <Card key={String(label)}><CardHeader className="pb-2"><p className="text-xs text-muted-foreground">{label}</p><CardTitle>{formatMoney(Number(value))}</CardTitle></CardHeader></Card>) : Array.from({length:6},(_,index)=><div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />)}
    </section>
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck2 className="text-primary" /> Conteo y confirmación</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4">
        <Field label="Fecha de negocio"><Input name="businessDate" type="date" value={businessDate} onChange={(event)=>setBusinessDate(event.target.value)} required /></Field>
        <Field label="Efectivo físico" tip="Cuenta el efectivo disponible. Se compara contra servicios registrados como efectivo."><Input name="physicalCash" type="number" min="0" step="0.01" required /></Field>
        <label className="flex items-center gap-3 rounded-xl border p-3 text-sm"><input name="hasMissingSales" type="checkbox" className="size-4 accent-primary" /> Sé que faltan ventas por registrar</label>
        <label className="flex items-center gap-3 rounded-xl border p-3 text-sm"><input name="hasMissingExpenses" type="checkbox" className="size-4 accent-primary" /> Sé que faltan gastos por registrar</label>
        <Field label="Notas"><Textarea name="notes" /></Field>
        <Button size="lg" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <LockKeyhole />}{pending ? "Calculando…" : "Guardar cierre"}</Button>
      </form></CardContent></Card>
      <div className="space-y-5"><Card className={result ? "animate-in fade-in zoom-in-95" : ""}><CardHeader><CardTitle>Resultado</CardTitle></CardHeader><CardContent>{result ? <div className="space-y-4"><div className="flex items-center gap-3">{result.status === "balanced" ? <CircleCheck className="size-8 text-emerald-600" /> : <CircleAlert className="size-8 text-amber-600" />}<div><p className="font-semibold">{result.status === "balanced" ? "Efectivo conciliado" : result.status === "difference" ? "Hay una diferencia" : "Revisión necesaria"}</p><p className="text-sm text-muted-foreground">Diferencia: {formatMoney(result.differenceMinor)}</p></div></div>{result.warnings.map((warning)=><p key={warning} className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{warning}</p>)}</div> : <div className="space-y-2 text-sm text-muted-foreground"><p>Estado actual: <strong className="text-foreground">{preview?.existingStatus ?? "cargando"}</strong></p><p>{preview?.visitCount ?? 0} visitas y {preview?.expenseCount ?? 0} gastos registrados.</p></div>}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">¿Falta algo?</CardTitle></CardHeader><CardContent className="grid gap-2"><Button asChild variant="outline"><Link href="/servicios/registrar"><Plus /> Registrar venta</Link></Button><Button asChild variant="outline"><Link href="/gastos"><ReceiptText /> Registrar gasto</Link></Button></CardContent></Card>
      </div>
    </div>
  </div>;
}

function Field({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="flex items-center gap-1"><Label>{label}</Label>{tip ? <InfoTip>{tip}</InfoTip> : null}</div>{children}</div>;
}
