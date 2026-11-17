"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "මුල් පිටුව" },
  { href: "/zodiac", label: "ලග්න විස්තර" },
  { href: "/horoscope/daily", label: "දෛනික පලාපල" },
  { href: "/services", label: "සේවාවන්" },
  { href: "/about", label: "අප ගැන" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="nav-link"
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
