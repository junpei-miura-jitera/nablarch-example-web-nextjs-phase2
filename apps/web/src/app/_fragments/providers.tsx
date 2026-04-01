"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";

/**
 * クライアント側プロバイダーのラッパー。
 */
export default function Providers({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
