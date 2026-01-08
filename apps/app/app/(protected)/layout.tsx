import {
  SidebarInset,
  SidebarProvider,
} from "@repo/design-system/components/ui/sidebar";
import { neonAuth } from "@neondatabase/neon-js/auth/next/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ensureUserExists } from "@/lib/sync-user";
import { DashboardHeader } from "./components/dashboard-header";
import { DashboardSidebar } from "./components/dashboard-sidebar";

type ProtectedLayoutProps = {
  readonly children: ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const { user } = await neonAuth();

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Automatically sync user to database when they access protected routes
  // This ensures the user exists before they try to create notes
  await ensureUserExists();

  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardSidebar />
      <SidebarInset className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
