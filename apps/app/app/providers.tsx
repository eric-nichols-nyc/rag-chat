"use client";

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      emailOTP
      Link={Link}
      navigate={router.push}
      onSessionChange={() => router.refresh()}
      redirectTo="/account/settings"
      replace={router.replace}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
