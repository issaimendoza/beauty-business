import Link from "next/link";
import { ArrowRight, BarChart3, CalendarCheck2, CircleDollarSign, ReceiptText, Sparkles, TrendingDown, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { businessService } from "@/shared/infrastructure/composition/business";
import { formatMoney } from "@/shared/domain/money";

export default async function DashboardPage() {
  const metrics = (await businessService.getInsights({ period: "month" })).metrics;
  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-pink-500 p-7 text-primary-foreground shadow-xl shadow-primary/15 sm:p-9">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold opacity-90"><Sparkles className="size-4" /> Resumen del negocio</p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Todo listo para registrar el día.</h1><p className="mt-3 max-w-xl text-sm leading-relaxed opacity-85 sm:text-base">Captura cada servicio y gasto al momento; tus métricas se actualizarán con la información real.</p></div>
          <Button asChild variant="secondary" size="lg"><Link href="/servicios/registrar"><CalendarCheck2 /> Registrar servicio</Link></Button>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Ingresos del mes", value: metrics.visits.current ? formatMoney(metrics.grossIncome.current) : "Sin datos", icon: CircleDollarSign },
          { label: "Para colaboradoras", value: metrics.visits.current ? formatMoney(metrics.professionalPayments.current) : "Sin datos", icon: UsersRound },
          { label: "Egresos", value: metrics.expenses.current ? formatMoney(metrics.expenses.current) : "Sin datos", icon: TrendingDown },
          { label: "Resultado preliminar", value: metrics.visits.current || metrics.expenses.current ? formatMoney(metrics.preliminaryResult.current) : "Sin datos", icon: BarChart3 },
        ].map((metric) => <Card key={metric.label}><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardDescription>{metric.label}</CardDescription><metric.icon className="size-5 text-primary" /></div><CardTitle className="text-2xl">{metric.value}</CardTitle></CardHeader></Card>)}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Registrar servicio", description: "Precio y reparto sugeridos, siempre ajustables con una razón.", href: "/servicios/registrar", icon: CalendarCheck2 },
          { title: "Registrar gasto", description: "Controla compras y salidas de dinero por categoría.", href: "/gastos", icon: ReceiptText },
          { title: "Abrir Insights", description: "Explora ingresos, egresos, pagos y tendencias.", href: "/insights", icon: BarChart3 },
        ].map((item) => (
          <Card key={item.href} className="group transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
            <CardHeader><div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="size-5" /></div><CardTitle>{item.title}</CardTitle><CardDescription>{item.description}</CardDescription></CardHeader>
            <CardContent><Button asChild variant="ghost" className="px-0 group-hover:translate-x-1"><Link href={item.href}>Abrir <ArrowRight /></Link></Button></CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
