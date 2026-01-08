"use client";

import { UserButton } from "@neondatabase/neon-js/auth/react/ui";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { SidebarTrigger } from "@repo/design-system/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-end gap-4">
        <ModeToggle />
        <UserButton size="icon" />
      </div>
    </header>
  );
}
