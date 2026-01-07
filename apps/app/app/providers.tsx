"use client";

import {
  NeonAuthUIProvider,
  UserButton,
} from "@neondatabase/neon-js/auth/react/ui";
import { ModeToggle } from "@repo/design-system/components/mode-toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
      emailOTP
      redirectTo="/account/settings"
    >
      <header className="flex h-16 items-center justify-end gap-4 p-4">
        <ModeToggle />
        <UserButton size="icon" />
      </header>
      {children}
    </NeonAuthUIProvider>
  );
}

