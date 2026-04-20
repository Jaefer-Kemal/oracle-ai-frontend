"use client";

import { useEffect } from "react";
import { performLegacyCleanup } from "@/lib/auth";

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Purge logic for old localStorage artifacts on app boot
    performLegacyCleanup();
  }, []);

  return <>{children}</>;
}
