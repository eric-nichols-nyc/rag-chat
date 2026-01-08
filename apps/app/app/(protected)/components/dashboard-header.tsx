"use client";

import { SidebarTrigger } from "@repo/design-system/components/ui/sidebar";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import {
  UserButton,
} from "@neondatabase/neon-js/auth/react/ui";

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-end gap-4">
        <ModeToggle />
        <UserButton size="icon" />
      </div>
    </header>
  );
}

