"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PollingWrapperProps = {
  noteId: string;
  isProcessing: boolean;
  children: React.ReactNode;
};

export function PollingWrapper({
  isProcessing,
  children,
}: PollingWrapperProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    // Poll every 2 seconds while processing
    const interval = setInterval(() => {
      router.refresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [isProcessing, router]);

  return <>{children}</>;
}
