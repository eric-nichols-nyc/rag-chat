"use client";

import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      // biome-ignore lint/suspicious/noExplicitAny: Type mismatch due to @better-fetch/fetch version conflict between 1.1.18 and 1.1.21
      authClient={authClient as any}
      emailOTP
      Link={Link}
      navigate={router.push}
      onSessionChange={() => router.refresh()}
      redirectTo="/ai-text-summarizer"
      replace={router.replace}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
