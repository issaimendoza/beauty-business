import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return <div className="flex min-h-[50vh] items-center justify-center text-primary" role="status"><LoaderCircle className="size-8 animate-spin" /><span className="sr-only">Cargando</span></div>;
}
