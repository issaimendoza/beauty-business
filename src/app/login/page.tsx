import { redirect } from "next/navigation";
import { Scissors, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/shared/infrastructure/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  if (await getSession()) {
    redirect("/");
  }
  const params = await searchParams;
  const requested = typeof params.next === "string" ? params.next : "/";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--color-secondary),transparent_42%),linear-gradient(to_bottom_right,var(--color-background),white)] p-4">
      <div className="absolute -left-20 top-10 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-16 bottom-0 size-80 rounded-full bg-accent/25 blur-3xl" />
      <div className="relative grid w-full max-w-4xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <section className="hidden lg:block">
          <div className="mb-7 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Scissors /></div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="size-4" /> Operación clara, decisiones tuyas</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-tight">Tu negocio, organizado en un solo lugar.</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">Registra servicios, controla gastos y entiende el desempeño sin perder la flexibilidad de ajustar cada sesión.</p>
        </section>
        <Card className="border-primary/10 bg-background/95 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardHeader className="p-7 pb-4">
            <div className="mb-6 h-12 w-40 rounded-xl border border-dashed border-primary/35 bg-primary/5" aria-label="Espacio para logotipo futuro" />
            <CardTitle className="text-2xl">Bienvenida</CardTitle>
            <CardDescription>Ingresa con una de las cuentas autorizadas.</CardDescription>
          </CardHeader>
          <CardContent className="p-7 pt-2"><LoginForm next={next} /></CardContent>
        </Card>
      </div>
    </main>
  );
}
