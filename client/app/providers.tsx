"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/context/auth/auth.context";
import MessagingWidget from "@/components/carpools/chat/MessagingWidget";

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MessagingWidget>{children}</MessagingWidget>
      </AuthProvider>
    </QueryClientProvider>
  );
}