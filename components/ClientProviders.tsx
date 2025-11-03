// app/providers.tsx or app/ClientProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
          {children}
    </SessionProvider>
  );
}
