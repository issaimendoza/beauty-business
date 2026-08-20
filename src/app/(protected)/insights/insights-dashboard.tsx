"use client";

import { BarChart3, CalendarRange, CircleDollarSign, LoaderCircle, Plus, ReceiptText, RefreshCw, Search, SlidersHorizontal, TrendingDown, TrendingUp, UsersRound, WalletCards, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { InsightDetailItem, InsightDetailKind, InsightDetailPage, InsightsResult, MetricComparison } from "@/modules/business/application/contracts";
import { formatMoney } from "@/shared/domain/money";
import { requestJson } from "@/shared/presentation/http";

type Option = { id: string; name: string };
type Auxiliaries = { products: Option[]; vendors: Option[]; expenseCategories: Option[] };
type InitialFilters = {
  period?: string; granularity?: string; startDate?: string; endDate?: string; professionalId?: string; serviceId?: string;
  serviceCategory?: string; paymentMethod?: string; paymentReceiver?: string; source?: string; customerKind?: string;
  expenseCategoryId?: string; productId?: string; vendorId?: string; lostReason?: string;
  priceAdjustmentReason?: string; splitAdjustmentReason?: string; compare?: string;
};

function aggregateSeries(rows: InsightsResult["daily"], granularity: string) {
  if (granularity === "day") return rows;
  const groups = new Map<string, InsightsResult["daily"][number]>();
  for (const row of rows) {
    let key = row.label.slice(0, 7);
    if (granularity === "week") {
      const date = new Date(`${row.label}T12:00:00Z`);
      const isoDay = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() - isoDay + 1);
      key = date.toISOString().slice(0, 10);
    }
    const current = groups.get(key) ?? { label: key, incomeMinor: 0, expenseMinor: 0, visits: 0 };
    current.incomeMinor += row.incomeMinor; current.expenseMinor += row.expenseMinor; current.visits += row.visits;
    groups.set(key, current);
  }
  return [...groups.values()];
}

export function InsightsDashboard({ staff, services, serviceCategories, auxiliaries, initial }: { staff: Option[]; services: Option[]; serviceCategories: string[]; auxiliaries: Auxiliaries; initial: InitialFilters }) {
  const router = useRouter(); const pathname = usePathname();
  const [period, setPeriod] = useState(initial.period ?? "month");
  const [granularity, setGranularity] = useState(initial.granularity ?? "auto");
  const [startDate, setStartDate] = useState(initial.startDate ?? "");
  const [endDate, setEndDate] = useState(initial.endDate ?? "");
  const [professionalId, setProfessionalId] = useState(initial.professionalId ?? "");
  const [serviceId, setServiceId] = useState(initial.serviceId ?? "");
  const [serviceCategory, setServiceCategory] = useState(initial.serviceCategory ?? "");
  const [paymentMethod, setPaymentMethod] = useState(initial.paymentMethod ?? "");
  const [paymentReceiver, setPaymentReceiver] = useState(initial.paymentReceiver ?? "");
  const [source, setSource] = useState(initial.source ?? "");
  const [customerKind, setCustomerKind] = useState(initial.customerKind ?? "");
  const [expenseCategoryId, setExpenseCategoryId] = useState(initial.expenseCategoryId ?? "");
  const [productId, setProductId] = useState(initial.productId ?? "");
  const [vendorId, setVendorId] = useState(initial.vendorId ?? "");
  const [lostReason, setLostReason] = useState(initial.lostReason ?? "");
  const [priceAdjustmentReason, setPriceAdjustmentReason] = useState(initial.priceAdjustmentReason ?? "");
  const [splitAdjustmentReason, setSplitAdjustmentReason] = useState(initial.splitAdjustmentReason ?? "");
  const [compare, setCompare] = useState(initial.compare !== "false");
  const [data, setData] = useState<InsightsResult>();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>();
  const [detailKind, setDetailKind] = useState<InsightDetailKind>();
  const [detailItems, setDetailItems] = useState<InsightDetailItem[]>([]);
  const [detailCursor, setDetailCursor] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const buildFilterParams = useCallback(() => {
      const params = new URLSearchParams({ period });
      params.set("granularity", granularity);
      if (period === "custom") { params.set("startDate", startDate); params.set("endDate", endDate); }
      if (professionalId) params.set("professionalId", professionalId);
      if (serviceId) params.set("serviceId", serviceId);
      if (serviceCategory) params.set("serviceCategory", serviceCategory);
      if (paymentMethod) params.set("paymentMethod", paymentMethod);
      if (paymentReceiver) params.set("paymentReceiver", paymentReceiver);
      if (source) params.set("source", source);
      if (customerKind) params.set("customerKind", customerKind);
      if (expenseCategoryId) params.set("expenseCategoryId", expenseCategoryId);
      if (productId) params.set("productId", productId);
      if (vendorId) params.set("vendorId", vendorId);
      if (lostReason) params.set("lostReason", lostReason);
      if (priceAdjustmentReason) params.set("priceAdjustmentReason", priceAdjustmentReason);
      if (splitAdjustmentReason) params.set("splitAdjustmentReason", splitAdjustmentReason);
      params.set("compare", String(compare));
      return params;
  }, [period, granularity, startDate, endDate, professionalId, serviceId, serviceCategory, paymentMethod, paymentReceiver, source, customerKind, expenseCategoryId, productId, vendorId, lostReason, priceAdjustmentReason, splitAdjustmentReason, compare]);

  const load = useCallback(async () => {
    if (period === "custom" && (!startDate || !endDate)) return;
    setLoading(true);
    try {
      const params = buildFilterParams();
      router.replace(`${pathname}?${params}`, { scroll: false });
      setData(await requestJson<InsightsResult>(`/api/insights?${params}`));
      setLastUpdated(new Date());
      setDetailKind(undefined); setDetailItems([]); setDetailCursor(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos cargar Insights."); }
    finally { setLoading(false); }
  }, [period, startDate, endDate, buildFilterParams, router, pathname]);

  async function loadDetails(kind: InsightDetailKind, cursor?: string, append = false) {
    setDetailLoading(true); setDetailKind(kind);
    try {
      const params = buildFilterParams(); params.set("kind", kind); params.set("limit", "20"); if (cursor) params.set("cursor", cursor);
      const page = await requestJson<InsightDetailPage>(`/api/insights/details?${params}`);
      setDetailItems((current) => append ? [...current, ...page.items] : page.items); setDetailCursor(page.nextCursor);
      if (!append) window.requestAnimationFrame(() => document.getElementById("detalle")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos abrir el detalle."); }
    finally { setDetailLoading(false); }
  }

  function clearFilters() {
    setPeriod("month"); setGranularity("auto"); setStartDate(""); setEndDate(""); setProfessionalId(""); setServiceId(""); setServiceCategory("");
    setPaymentMethod(""); setPaymentReceiver(""); setSource(""); setCustomerKind(""); setExpenseCategoryId(""); setProductId("");
    setVendorId(""); setLostReason(""); setPriceAdjustmentReason(""); setSplitAdjustmentReason(""); setCompare(true);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const resolvedGranularity = granularity === "auto" ? period === "year" ? "month" : period === "last30" ? "week" : period === "custom" && data && data.daily.length > 120 ? "month" : period === "custom" && data && data.daily.length > 45 ? "week" : "day" : granularity;
  const daily = aggregateSeries(data?.daily ?? [], resolvedGranularity).map((item) => ({ ...item, ingresos: item.incomeMinor / 100, egresos: item.expenseMinor / 100 }));
  const activeDimensions = [professionalId, serviceId, serviceCategory, paymentMethod, paymentReceiver, source, customerKind, expenseCategoryId, productId, vendorId, lostReason, priceAdjustmentReason, splitAdjustmentReason].filter(Boolean).length;
  const activeFilterLabels = [
    professionalId && `Colaboradora: ${staff.find((item) => item.id === professionalId)?.name ?? professionalId}`,
    serviceId && `Servicio: ${services.find((item) => item.id === serviceId)?.name ?? serviceId}`,
    serviceCategory && `Categoría: ${serviceCategory}`, paymentMethod && `Pago: ${paymentMethod}`, paymentReceiver && `Receptor: ${paymentReceiver}`,
    source && `Origen: ${source}`, customerKind && `Cliente: ${customerKind}`,
    expenseCategoryId && `Gasto: ${auxiliaries.expenseCategories.find((item) => item.id === expenseCategoryId)?.name ?? expenseCategoryId}`,
    productId && `Producto: ${auxiliaries.products.find((item) => item.id === productId)?.name ?? productId}`,
    vendorId && `Proveedor: ${auxiliaries.vendors.find((item) => item.id === vendorId)?.name ?? vendorId}`,
    lostReason && `Pérdida: ${lostReason}`, priceAdjustmentReason && `Ajuste precio: ${priceAdjustmentReason}`, splitAdjustmentReason && `Ajuste reparto: ${splitAdjustmentReason}`,
  ].filter((value): value is string => Boolean(value));
  return <div className="space-y-6">
    <Card><CardContent className="space-y-5 p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Filter label="Periodo"><Select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="day">Hoy</option><option value="week">Esta semana</option><option value="month">Este mes</option><option value="year">Este año</option><option value="last30">Últimos 30 días</option><option value="custom">Rango personalizado</option></Select></Filter>
        <Filter label="Granularidad"><Select value={granularity} onChange={(event) => setGranularity(event.target.value)}><option value="auto">Automática</option><option value="day">Diaria</option><option value="week">Semanal</option><option value="month">Mensual</option></Select></Filter>
        {period === "custom" ? <><Filter label="Desde"><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></Filter><Filter label="Hasta"><Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></Filter></> : null}
        <Filter label="Colaboradora"><Select value={professionalId} onChange={(event) => setProfessionalId(event.target.value)}><option value="">Todas</option>{staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Filter>
        <Filter label="Servicio"><Select value={serviceId} onChange={(event) => setServiceId(event.target.value)}><option value="">Todos</option>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Filter>
        <Filter label="Método de pago"><Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="">Todos</option><option value="cash">Efectivo</option><option value="card">Tarjeta</option><option value="transfer">Transferencia</option><option value="other">Otro</option></Select></Filter>
        <div className="flex items-end gap-2"><Button variant="outline" className="flex-1" onClick={load} disabled={loading || (period === "custom" && (!startDate || !endDate))}>{loading ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} Aplicar</Button><Button variant="ghost" size="sm" onClick={clearFilters}><X /> Limpiar</Button></div>
      </div>
      <details className="group rounded-xl border bg-muted/25 p-4" open={activeDimensions > 3}>
        <summary className="flex cursor-pointer list-none items-center gap-2 font-medium"><SlidersHorizontal className="size-4 text-primary" /> Más dimensiones {activeDimensions ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{activeDimensions} activas</span> : null}</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Filter label="Categoría de servicio"><Select value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)}><option value="">Todas</option>{serviceCategories.map((item) => <option key={item} value={item}>{item}</option>)}</Select></Filter>
          <Filter label="Receptor inicial"><Select value={paymentReceiver} onChange={(event) => setPaymentReceiver(event.target.value)}><option value="">Todos</option><option value="salon">Salón</option><option value="professional">Colaboradora</option><option value="unknown">Desconocido</option></Select></Filter>
          <Filter label="Origen de demanda"><Select value={source} onChange={(event) => setSource(event.target.value)}><option value="">Todos</option><option value="salon">Salón</option><option value="professional">Colaboradora</option><option value="unknown">Desconocido</option></Select></Filter>
          <Filter label="Tipo de cliente"><Select value={customerKind} onChange={(event) => setCustomerKind(event.target.value)}><option value="">Todos</option><option value="new">Nuevo</option><option value="returning">Recurrente</option><option value="unspecified">No indicado</option></Select></Filter>
          <Filter label="Categoría de gasto"><Select value={expenseCategoryId} onChange={(event) => setExpenseCategoryId(event.target.value)}><option value="">Todas</option>{auxiliaries.expenseCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Filter>
          <Filter label="Producto"><Select value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">Todos</option>{auxiliaries.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Filter>
          <Filter label="Proveedor"><Select value={vendorId} onChange={(event) => setVendorId(event.target.value)}><option value="">Todos</option>{auxiliaries.vendors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Filter>
          <Filter label="Motivo de oportunidad perdida"><Select value={lostReason} onChange={(event) => setLostReason(event.target.value)}><option value="">Todos</option><option value="no_availability">Sin disponibilidad</option><option value="service_unavailable">Servicio no disponible</option><option value="price">Precio</option><option value="client_cancelled">Cliente canceló</option><option value="no_show">No se presentó</option><option value="schedule">Horario incompatible</option><option value="no_response">Sin respuesta</option><option value="other">Otro</option></Select></Filter>
          <Filter label="Motivo de cambio de precio"><Input value={priceAdjustmentReason} onChange={(event) => setPriceAdjustmentReason(event.target.value)} placeholder="Ej. promotion" /></Filter>
          <Filter label="Motivo de cambio de reparto"><Input value={splitAdjustmentReason} onChange={(event) => setSplitAdjustmentReason(event.target.value)} placeholder="Ej. session_agreement" /></Filter>
        </div>
      </details>
      {activeFilterLabels.length ? <div className="flex flex-wrap gap-2" aria-label="Filtros activos">{activeFilterLabels.map((label) => <span key={label} className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">{label}</span>)}</div> : null}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} className="size-4 accent-primary" /> Comparar con periodo anterior <InfoTip>Usa un periodo inmediatamente anterior con la misma cantidad de días.</InfoTip></label>
      <p className="text-xs text-muted-foreground">Los filtros se aplican a la fuente correspondiente: servicio, visita, gasto u oportunidad perdida. Las dimensiones que no existen en una fuente no alteran esa fuente.</p>
    </CardContent></Card>
    {loading && !data ? <div className="flex min-h-64 items-center justify-center text-primary" role="status"><LoaderCircle className="size-8 animate-spin" /><span className="sr-only">Cargando métricas</span></div> : null}
    {data ? <>
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><CalendarRange className="size-4 text-primary" /> Del {data.range.startDate} al {data.range.endDate}{lastUpdated ? <span>· Actualizado {lastUpdated.toLocaleTimeString("es-MX")}</span> : null}</p>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Ingresos cobrados" metric={data.metrics.grossIncome} money icon={CircleDollarSign} compare={compare} empty={data.metrics.visits.current===0} onOpen={() => loadDetails("visits")} />
        <MetricCard title="Ingreso del salón" metric={data.metrics.salonIncome} money icon={WalletCards} compare={compare} empty={data.metrics.visits.current===0} onOpen={() => loadDetails("visits")} />
        <MetricCard title="Pagos a colaboradoras" metric={data.metrics.professionalPayments} money icon={UsersRound} compare={compare} empty={data.metrics.visits.current===0} onOpen={() => loadDetails("visits")} />
        <MetricCard title="Egresos registrados" metric={data.metrics.expenses} money icon={TrendingDown} inverse compare={compare} empty={data.recentExpenses.length===0} onOpen={() => loadDetails("expenses")} />
        <MetricCard title="Resultado preliminar" metric={data.metrics.preliminaryResult} money icon={BarChart3} compare={compare} empty={data.metrics.visits.current===0&&data.recentExpenses.length===0} tip="Ingreso asignado al salón menos egresos registrados. No representa utilidad contable." />
        <MetricCard title="Visitas" metric={data.metrics.visits} icon={Search} compare={compare} empty={data.metrics.visits.current===0} onOpen={() => loadDetails("visits")} />
        <MetricCard title="Servicios realizados" metric={data.metrics.services} icon={Search} compare={compare} empty={data.metrics.services.current===0} onOpen={() => loadDetails("visits")} />
        <MetricCard title="Ticket promedio" metric={data.metrics.averageTicket} money icon={CircleDollarSign} compare={compare} empty={data.metrics.visits.current===0} onOpen={() => loadDetails("visits")} />
        <MetricCard title="Duración promedio" metric={data.metrics.averageDurationMinutes} icon={CalendarRange} compare={compare} suffix=" min" empty={data.metrics.averageDurationMinutes.current===0} onOpen={() => loadDetails("visits")} />
        <MetricCard title="Oportunidades perdidas" metric={data.metrics.lostOpportunities} icon={TrendingDown} inverse compare={compare} empty={data.metrics.lostOpportunities.current===0} onOpen={() => loadDetails("lost")} />
        <MetricCard title="Monto potencial perdido" metric={data.metrics.estimatedLost} money icon={TrendingDown} inverse compare={compare} empty={data.metrics.lostOpportunities.current===0} onOpen={() => loadDetails("lost")} />
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Ingresos y egresos" description="Evolución diaria en el periodo"><ResponsiveContainer width="100%" height={300}><AreaChart data={daily}><defs><linearGradient id="income" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35}/><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label" fontSize={11}/><YAxis fontSize={11}/><Tooltip formatter={(value) => formatMoney(Number(value) * 100)}/><Legend/><Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="var(--color-primary)" fill="url(#income)"/><Area type="monotone" dataKey="egresos" name="Egresos" stroke="var(--color-destructive)" fill="transparent"/></AreaChart></ResponsiveContainer><AccessibleTable caption="Ingresos y egresos por día" rows={daily.map((item) => [item.label, formatMoney(item.incomeMinor), formatMoney(item.expenseMinor), String(item.visits)])} headers={["Día", "Ingresos", "Egresos", "Servicios"]}/></ChartCard>
        <ChartCard title="Ingresos por colaboradora" description="Importe final de servicios"><ResponsiveContainer width="100%" height={300}><BarChart data={data.byProfessional.map((item) => ({ ...item, value: item.valueMinor / 100 }))} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" fontSize={11}/><YAxis type="category" dataKey="label" width={110} fontSize={11}/><Tooltip formatter={(value) => formatMoney(Number(value) * 100)}/><Bar dataKey="value" name="Ingresos" fill="var(--color-primary)" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer><AccessibleTable caption="Ingresos por colaboradora" rows={data.byProfessional.map((item) => [item.label, formatMoney(item.valueMinor), formatMoney(item.salonMinor), formatMoney(item.professionalMinor), String(item.visits)])} headers={["Colaboradora", "Venta bruta", "Para salón", "Para colaboradora", "Visitas"]}/></ChartCard>
        <ChartCard title="Servicios con mayor ingreso" description="Desglose para profundizar"><ResponsiveContainer width="100%" height={300}><BarChart data={data.byService.slice(0,10).map((item) => ({ ...item, value: item.valueMinor / 100 }))}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label" fontSize={10}/><YAxis fontSize={11}/><Tooltip formatter={(value) => formatMoney(Number(value) * 100)}/><Bar dataKey="value" name="Ingresos" fill="oklch(0.72 0.13 20)" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer><AccessibleTable caption="Ingresos por servicio" rows={data.byService.map((item) => [item.label, formatMoney(item.valueMinor), formatMoney(item.salonMinor), formatMoney(item.professionalMinor), String(item.visits), `${item.averageDurationMinutes.toFixed(0)} min`])} headers={["Servicio", "Venta bruta", "Para salón", "Para colaboradora", "Visitas", "Duración promedio"]}/></ChartCard>
        <ChartCard title="Egresos por categoría" description="Distribución de las salidas registradas"><ResponsiveContainer width="100%" height={300}><BarChart data={data.byExpenseCategory.map((item) => ({ ...item, value: item.valueMinor / 100 }))} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" fontSize={11}/><YAxis type="category" dataKey="label" width={110} fontSize={11}/><Tooltip formatter={(value) => formatMoney(Number(value) * 100)}/><Bar dataKey="value" name="Egresos" fill="var(--color-destructive)" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer><AccessibleTable caption="Egresos por categoría" rows={data.byExpenseCategory.map((item) => [item.label, formatMoney(item.valueMinor)])} headers={["Categoría", "Egresos"]}/></ChartCard>
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <TableCard title="Pagos y flujo" description="El receptor inicial no equivale al propietario económico del dinero. No es conciliación bancaria." headers={["Dimensión", "Importe"]} rows={[...data.byPaymentMethod.map((item)=>[`Método: ${item.label}`,formatMoney(item.valueMinor)]),...data.byReceiver.map((item)=>[`Receptor: ${item.label}`,formatMoney(item.valueMinor)]),...data.byPaymentFlow.map((item)=>[`${item.method} recibido por ${item.receiver}`,formatMoney(item.valueMinor)])]} />
        <TableCard title="Demanda y clientela" description="La demanda atendida y perdida se muestran de forma descriptiva, no como tasa de conversión." headers={["Dimensión", "Cantidad", "Importe"]} rows={[...data.bySource.map((item)=>[`Origen atendido: ${item.label}`,String(item.visits),formatMoney(item.valueMinor)]),...data.byCustomerKind.map((item)=>[`Cliente atendido: ${item.label}`,String(item.visits),"—"]),...data.byLostReason.map((item)=>[`Motivo perdido: ${item.label}`,String(item.opportunities),formatMoney(item.estimatedMinor)]),...data.byLostService.map((item)=>[`Servicio perdido: ${item.label}`,String(item.opportunities),formatMoney(item.estimatedMinor)]),...data.byLostChannel.map((item)=>[`Canal perdido: ${item.label}`,String(item.opportunities),"—"]),...data.lostByCustomerKind.map((item)=>[`Cliente perdido: ${item.label}`,String(item.opportunities),"—"])]} />
        <TableCard title="Ajustes manuales" description="Las diferencias son decisiones registradas con su motivo, no anomalías automáticas." headers={["Tipo", "Motivo", "Casos", "Diferencia"]} rows={data.adjustments.map((item)=>[item.type === "price"?"Precio":"Reparto",item.label,String(item.count),formatMoney(item.differenceMinor)])} />
        <TableCard title="Calidad y conciliación" description="Días cerrados y diferencias detectadas en el periodo." headers={["Estado", "Días", "Diferencia absoluta"]} rows={data.closureQuality.map((item)=>[item.label,String(item.days),formatMoney(item.differenceMinor)])} />
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <TableCard title="Compras y egresos" description="Desglose por tipo, proveedor y producto con los mismos filtros del periodo." headers={["Dimensión", "Importe"]} rows={[...data.byExpenseKind.map((item)=>[`Tipo: ${item.label}`,formatMoney(item.valueMinor)]),...data.byVendor.map((item)=>[`Proveedor: ${item.label}`,formatMoney(item.valueMinor)]),...data.byProduct.map((item)=>[`Producto: ${item.label}`,formatMoney(item.valueMinor)])]} />
        <TableCard title="Actividad por día y hora" description="Distribución de servicios usando la hora real cuando existe y la hora de la visita como respaldo." headers={["Día ISO", "Hora", "Servicios", "Venta bruta"]} rows={data.activityByWeekdayHour.map((item)=>[String(item.weekday),`${String(item.hour).padStart(2,"0")}:00`,String(item.services),formatMoney(item.valueMinor)])} />
      </section>
      <Card><CardHeader><CardTitle>Servicios recientes del periodo</CardTitle><CardDescription>Detalle trazable de los registros incluidos.</CardDescription></CardHeader><CardContent><AccessibleTable caption="Servicios recientes" rows={data.recentVisits.map((item) => [new Date(item.occurredAt).toLocaleString("es-MX"), item.customerName ?? "Sin nombre", item.paymentMethod, formatMoney(item.totalMinor)])} headers={["Fecha", "Cliente", "Pago", "Total"]} visible /></CardContent></Card>
      <section className="grid gap-5 xl:grid-cols-2"><TableCard title="Egresos fuente" description="Registros que componen los egresos del periodo." headers={["Fecha", "Concepto", "Método", "Importe"]} rows={data.recentExpenses.map((item)=>[new Date(item.occurredAt).toLocaleString("es-MX"),item.description,item.paymentMethod,formatMoney(item.amountMinor)])}/><TableCard title="Oportunidades fuente" description="Solicitudes no concretadas incluidas en el periodo." headers={["Fecha", "Servicio", "Motivo", "Estimado"]} rows={data.recentLostOpportunities.map((item)=>[new Date(item.occurredAt).toLocaleString("es-MX"),item.service,item.reason,formatMoney(item.estimatedMinor)])}/></section>
      <Card id="detalle"><CardHeader><CardTitle>Detalle paginado y reconciliable</CardTitle><CardDescription>Abre los registros fuente con los filtros globales actuales. Cada página conserva orden estable por fecha e identificador.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-2"><Button type="button" variant={detailKind === "visits" ? "default" : "outline"} onClick={() => loadDetails("visits")}><Search /> Servicios</Button><Button type="button" variant={detailKind === "expenses" ? "default" : "outline"} onClick={() => loadDetails("expenses")}><ReceiptText /> Egresos</Button><Button type="button" variant={detailKind === "lost" ? "default" : "outline"} onClick={() => loadDetails("lost")}><TrendingDown /> Oportunidades</Button></div>{detailLoading && detailItems.length === 0 ? <p className="flex items-center gap-2 text-sm text-primary" role="status"><LoaderCircle className="size-4 animate-spin" /> Cargando detalle…</p> : null}{detailKind ? <AccessibleTable caption={`Detalle ${detailKind}`} headers={["Fecha", "Concepto", "Dimensión", "Importe"]} rows={detailItems.map((item)=>[new Date(item.occurredAt).toLocaleString("es-MX"),item.concept,item.dimension,formatMoney(item.amountMinor)])} visible /> : <p className="text-sm text-muted-foreground">Selecciona una fuente para revisar todos sus registros por páginas.</p>}{detailCursor ? <Button type="button" variant="outline" disabled={detailLoading} onClick={() => loadDetails(detailKind!, detailCursor, true)}>{detailLoading ? <LoaderCircle className="animate-spin" /> : <Plus />} Cargar más registros</Button> : null}</CardContent></Card>
    </> : null}
  </div>;
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }

function MetricCard({ title, metric, money, icon: Icon, inverse, tip, compare, suffix = "", empty, onOpen }: { title: string; metric: MetricComparison; money?: boolean; icon: React.ComponentType<{ className?: string }>; inverse?: boolean; tip?: string; compare: boolean; suffix?: string; empty?: boolean; onOpen?: () => void }) { const positive = (metric.changePercent ?? 0) >= 0; const favorable = inverse ? !positive : positive; const content = <><CardHeader className="pb-2"><div className="flex items-center justify-between"><div className="flex items-center gap-1"><CardDescription>{title}</CardDescription>{tip ? <InfoTip>{tip}</InfoTip> : null}</div><Icon className="size-5 text-primary" /></div><CardTitle className="text-2xl">{empty ? "Sin datos" : money ? formatMoney(metric.current) : `${metric.current.toLocaleString("es-MX")}${suffix}`}</CardTitle></CardHeader>{compare && !empty ? <CardContent><span className={`inline-flex items-center gap-1 text-xs font-semibold ${favorable ? "text-emerald-700" : "text-amber-700"}`}>{positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}{metric.changePercent === null ? "Sin base anterior" : `${metric.changePercent.toFixed(1)}% vs. periodo anterior`}</span></CardContent> : null}</>; return <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">{onOpen ? <button type="button" className="w-full text-left" onClick={onOpen} aria-label={`Abrir detalle de ${title}`}>{content}</button> : content}</Card>; }

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card>; }

function TableCard({ title, description, headers, rows }: { title: string; description: string; headers: string[]; rows: string[][] }) { return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><AccessibleTable caption={title} headers={headers} rows={rows} visible /></CardContent></Card>; }

function AccessibleTable({ caption, headers, rows, visible = false }: { caption: string; headers: string[]; rows: string[][]; visible?: boolean }) { return <div className={visible ? "overflow-x-auto" : "sr-only"}><table className="w-full text-left text-sm"><caption className="sr-only">{caption}</caption><thead><tr className="border-b">{headers.map((header) => <th key={header} className="px-3 py-2 font-semibold">{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${row[0]}-${rowIndex}`} className="border-b last:border-0">{row.map((cell, index) => <td key={`${cell}-${index}`} className="px-3 py-2 text-muted-foreground">{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 ? <p className="p-6 text-center text-muted-foreground">No hay datos para estos filtros.</p> : null}</div>; }
