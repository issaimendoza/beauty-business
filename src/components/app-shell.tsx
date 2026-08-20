"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  ReceiptText,
  Scissors,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/shared/presentation/auth-client";
import { cn } from "@/shared/presentation/cn";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/servicios/registrar", label: "Registrar servicio", icon: CalendarCheck2 },
  { href: "/gastos", label: "Gastos", icon: ReceiptText },
  { href: "/oportunidades", label: "Oportunidades", icon: BriefcaseBusiness },
  { href: "/cierre", label: "Cierre diario", icon: CircleDollarSign },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/catalogos/colaboradoras", label: "Colaboradoras", icon: UsersRound },
  { href: "/catalogos/servicios", label: "Servicios", icon: Scissors },
  { href: "/catalogos/auxiliares", label: "Otros catálogos", icon: PackageSearch },
];

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-muted/35">
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-border/80 bg-background/90 px-4 backdrop-blur lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label="Abrir menú">
          {open ? <X /> : <Menu />}
        </Button>
        <div className="ml-3 h-8 w-36 rounded-lg border border-dashed border-primary/35 bg-primary/5" aria-label="Espacio para logotipo futuro" />
      </header>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-border/80 bg-background p-4 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none",
          open && "translate-x-0",
        )}
      >
        <div className="mb-7 flex h-12 items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Scissors className="size-5" />
          </div>
          <div>
            <div className="font-semibold">Beauty Business</div>
            <div className="text-xs text-muted-foreground">Espacio de marca futuro</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Navegación principal">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-primary/8 hover:text-primary",
                  active && "bg-primary/10 text-primary",
                )}
              >
                <item.icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-2xl border border-border bg-muted/45 p-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserRound className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">Acceso completo</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut /> Cerrar sesión
          </Button>
        </div>
      </aside>
      {open ? <button className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú" /> : null}
      <main className="min-h-screen lg:pl-72">
        <div className="mx-auto w-full max-w-[1480px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
