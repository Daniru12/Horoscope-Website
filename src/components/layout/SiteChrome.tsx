"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hides the public site's header/footer inside the admin app, which has its own navigation. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
