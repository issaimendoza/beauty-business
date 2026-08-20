"use client";

import { Eye, EyeOff, FolderTree, LoaderCircle, Package, Plus, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jsonPost, requestJson } from "@/shared/presentation/http";

type Data = { products: Array<{ id: string; name: string; active: boolean }>; vendors: Array<{ id: string; name: string; active: boolean }>; expenseCategories: Array<{ id: string; name: string; active: boolean }> };
const groups = [
  { type: "product" as const, key: "products" as const, title: "Productos", icon: Package },
  { type: "vendor" as const, key: "vendors" as const, title: "Proveedores", icon: Store },
  { type: "expenseCategory" as const, key: "expenseCategories" as const, title: "Categorías de gasto", icon: FolderTree },
];

export function AuxiliaryCatalogs({ initialData }: { initialData: Data }) {
  const router = useRouter(); const [pending, setPending] = useState<string>();
  async function submit(event: React.FormEvent<HTMLFormElement>, type: string) { event.preventDefault(); setPending(type); const form = event.currentTarget; const data = new FormData(form); try { await requestJson("/api/auxiliaries", jsonPost({ type, name: data.get("name") })); toast.success("Elemento agregado"); form.reset(); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos guardar."); } finally { setPending(undefined); } }
  async function toggle(type: string, id: string) { const key = `${type}:${id}`; setPending(key); try { await requestJson(`/api/auxiliaries/${type}/${id}/toggle`, jsonPost({})); toast.success("Estado actualizado"); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "No pudimos actualizar el elemento."); } finally { setPending(undefined); } }
  return <div className="grid gap-5 lg:grid-cols-3">{groups.map((group) => <Card key={group.type}><CardHeader><CardTitle className="flex items-center gap-2"><group.icon className="text-primary" /> {group.title}</CardTitle></CardHeader><CardContent className="space-y-4"><form className="flex gap-2" onSubmit={(event) => submit(event, group.type)}><div className="flex-1"><Label className="sr-only">Nombre</Label><Input name="name" placeholder="Agregar…" required /></div><Button size="icon" aria-label={`Agregar ${group.title}`} disabled={pending === group.type}>{pending === group.type ? <LoaderCircle className="animate-spin" /> : <Plus />}</Button></form><ul className="divide-y divide-border">{initialData[group.key].map((item) => <li key={item.id} className={`flex items-center justify-between gap-2 py-2 text-sm ${item.active ? "" : "text-muted-foreground line-through"}`}><span>{item.name}</span><Button type="button" variant="ghost" size="icon" aria-label={item.active ? `Desactivar ${item.name}` : `Activar ${item.name}`} disabled={pending === `${group.type}:${item.id}`} onClick={() => toggle(group.type, item.id)}>{pending === `${group.type}:${item.id}` ? <LoaderCircle className="animate-spin" /> : item.active ? <EyeOff /> : <Eye />}</Button></li>)}</ul>{initialData[group.key].length === 0 ? <p className="text-sm text-muted-foreground">Sin elementos todavía.</p> : null}</CardContent></Card>)}</div>;
}
