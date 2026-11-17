"use client";

import Link from "next/link";
import type { ReactNode, PointerEvent } from "react";

/** A link-card whose glow follows the pointer. */
export default function SpotlightLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Link href={href} onPointerMove={onMove} className={`spotlight ${className}`}>
      {children}
    </Link>
  );
}
