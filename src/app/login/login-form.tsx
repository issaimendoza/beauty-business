"use client";

import { Eye, EyeOff, LoaderCircle, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/shared/presentation/auth-client";

export function LoginForm({ next = "/" }: { next?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(undefined);
    const formData = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      rememberMe: false,
    });
    setPending(false);

    if (result.error) {
      setMessage(
        result.error.status === 429
          ? "Hay demasiados intentos. Espera un minuto y vuelve a intentarlo."
          : "No pudimos iniciar sesión. Revisa tus datos o solicita apoyo a la persona responsable.",
      );
      return;
    }

    window.location.replace(next);
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2"><Mail className="size-4 text-primary" /> Correo</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required placeholder="tu@correo.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Contraseña</Label>
        <div className="relative">
          <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={12} className="pr-12" />
          <button type="button" className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/8 hover:text-primary" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {message ? <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{message}</p> : null}
      <Button className="w-full" size="lg" disabled={pending} aria-busy={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
