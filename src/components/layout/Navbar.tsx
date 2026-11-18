import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import BottomNav from "./BottomNav";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const session = await auth();
  const isAdmin = (session as any)?.user?.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[var(--hairline)] bg-space-900/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-14 lg:h-[68px] flex items-center justify-between gap-4 max-w-7xl">
          <Link href="/" className="flex items-center gap-3 min-w-0 flex-shrink-0 group">
            <img
              src="/horoscope-result-1.png"
              alt="සුභද්‍රා ජ්‍යෝතිෂ්‍ය ලාංඡනය"
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-full object-cover ring-1 ring-gold-500/50 ring-offset-2 ring-offset-space-900 flex-shrink-0 transition-transform duration-700 group-hover:rotate-[360deg]"
            />
            <span className="font-serif text-lg lg:text-xl font-bold tracking-wide text-gold-gradient truncate">
              සුභද්‍රා ජ්‍යෝතිෂ්‍ය
            </span>
          </Link>

          <nav className="hidden lg:flex gap-8 items-center whitespace-nowrap text-[0.95rem] font-medium">
            <NavLinks />
            {session && !isAdmin && (
              <Link href="/profile" className="nav-link">
                මගේ ගිණුම
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="nav-link !text-emerald-300 font-bold">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            {session ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/profile"}
                  className="flex items-center gap-2 hover:text-gold-300 transition-colors"
                  aria-label="මගේ ගිණුම"
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-full ring-1 ring-gold-500 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full ring-1 ring-gold-500 flex items-center justify-center bg-space-800 flex-shrink-0">
                      <User className="w-4 h-4 text-gold-400" />
                    </div>
                  )}
                  <span className="text-sm hidden xl:block">{session.user?.name}</span>
                </Link>
                <form
                  className="hidden lg:block"
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    aria-label="ඉවත් වන්න"
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-red-300 hover:text-red-200"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Phones: a compact icon. Desktop: the full button (wrapped, because .btn-ghost sets display). */}
                <Link
                  href="/login"
                  aria-label="ඇතුළු වන්න"
                  className="lg:hidden grid place-items-center w-10 h-10 rounded-full border border-[var(--hairline-strong)] text-gold-200"
                >
                  <User className="w-[18px] h-[18px]" />
                </Link>
                <span className="hidden lg:block">
                  <Link href="/login" className="btn-ghost !py-2 !px-5 text-sm">
                    <User className="w-4 h-4" />
                    <span>ඇතුළු වන්න</span>
                  </Link>
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Outside <header>: the header's backdrop blur would trap fixed children inside the bar. */}
      <BottomNav session={session as any} />
    </>
  );
}
