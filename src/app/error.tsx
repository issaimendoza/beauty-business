"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Error de interfaz", error); }, [error]);
  return <main className="flex min-h-screen items-center justify-center p-6"><div className="max-w-md text-center"><CircleAlert className="mx-auto mb-4 size-10 text-destructive" /><h1 className="text-2xl font-semibold">No pudimos completar la acción</h1><p className="mt-2 text-muted-foreground">Vuelve a intentarlo. Si el problema continúa, solicita apoyo e indica el momento en que ocurrió.</p><Button className="mt-6" onClick={reset}><RefreshCw /> Reintentar</Button></div></main>;
}
