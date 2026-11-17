"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Star, Sun, Sparkles, MoreHorizontal, Info, BookOpen, MessageCircle, User, LogOut, ChevronRight, X, ShieldCheck, UserPlus } from "lucide-react";

type SessionLike = { user?: { name?: string | null; image?: string | null; role?: string } } | null;

const TABS = [
  { href: "/", label: "මුල් පිටුව", icon: Home },
  { href: "/zodiac", label: "ලග්න", icon: Star },
  { href: "/horoscope/daily", label: "පලාපල", icon: Sun },
  { href: "/services", label: "සේවා", icon: Sparkles },
];

const MORE_PATHS = ["/about", "/blog", "/contact", "/profile", "/login", "/signup"];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

/** App-style bottom tab bar for phones and tablets. The desktop top bar takes over from 1024px. */
export default function BottomNav({ session }: { session: SessionLike }) {
  const pathname = usePathname() || "/";
  const [moreOpen, setMoreOpen] = useState(false);
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const moreActive = MORE_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const row = "flex items-center gap-3 px-4 h-14 text-left hover:bg-white/[0.04] w-full";

  return (
    <>
      <nav
        aria-label="ප්‍රධාන මෙනුව"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16">
          {TABS.map((t) => {
            const active = isActive(pathname, t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] ${active ? "text-gold-200" : "text-gray-500"}`}
              >
                <span className={`grid place-items-center w-14 h-8 rounded-full transition-colors ${active ? "bg-gold-400/15" : ""}`}>
                  <t.icon className="w-[21px] h-[21px]" />
                </span>
                {t.label}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            className={`flex flex-col items-center justify-center gap-1 text-[11px] ${moreActive || moreOpen ? "text-gold-200" : "text-gray-500"}`}
          >
            <span className={`grid place-items-center w-14 h-8 rounded-full transition-colors ${moreActive || moreOpen ? "bg-gold-400/15" : ""}`}>
              <MoreHorizontal className="w-[21px] h-[21px]" />
            </span>
            තවත්
          </button>
        </div>
      </nav>

      {/* Sibling of <nav>, not a child: the nav's backdrop blur would trap a fixed child inside the bar. */}
      <AnimatePresence>
        {moreOpen && (
          <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="තවත් විකල්ප">
            <motion.div
              className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              data-lenis-prevent
              className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto bg-[#0a0f1e] rounded-t-[28px] border-t border-white/[0.08] px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mx-auto h-1.5 w-10 rounded-full bg-white/20 mb-3" aria-hidden="true" />
              <div className="flex items-center justify-between px-1 mb-3">
                <h2 className="text-lg font-semibold text-white">තවත්</h2>
                <button onClick={() => setMoreOpen(false)} aria-label="වසන්න" className="grid place-items-center w-10 h-10 -mr-2 rounded-full text-gray-300 hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {user && (
                <Link href={isAdmin ? "/admin" : "/profile"} className="flex items-center gap-3 p-3 mb-4 rounded-2xl bg-white/[0.05]">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-gold-400/15 text-gold-200 font-semibold">
                      {(user.name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-white font-semibold truncate">{user.name}</span>
                    <span className="block text-sm text-gray-400">{isAdmin ? "පරිපාලක පුවරුව" : "මගේ ගිණුම"}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </Link>
              )}

              <div className="rounded-2xl bg-[#0d1426] border border-white/[0.07] divide-y divide-white/[0.06] overflow-hidden">
                {[
                  { href: "/about", label: "අප ගැන", icon: Info },
                  { href: "/blog", label: "ජ්‍යෝතිෂ්‍ය ලිපි", icon: BookOpen },
                  { href: "/contact", label: "අප අමතන්න", icon: MessageCircle },
                  ...(isAdmin ? [{ href: "/admin", label: "පරිපාලක පුවරුව", icon: ShieldCheck }] : []),
                ].map((r) => (
                  <Link key={r.href} href={r.href} className={row}>
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/[0.06] text-gray-300">
                      <r.icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="flex-1 text-[15px] text-gray-100">{r.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </Link>
                ))}
              </div>

              <div className="mt-4">
                {user ? (
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-red-500/10 text-red-300 font-semibold"
                  >
                    <LogOut className="w-5 h-5" /> ඉවත් වන්න
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" className="btn-gold !h-12 !py-0">
                      <User className="w-4 h-4" /> ඇතුළු වන්න
                    </Link>
                    <Link href="/signup" className="btn-ghost !h-12 !py-0">
                      <UserPlus className="w-4 h-4" /> ලියාපදිංචි වන්න
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
