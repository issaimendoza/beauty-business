import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/shared/infrastructure/auth/session";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AppShell userName={session.user.name}>{children}</AppShell>;
}
