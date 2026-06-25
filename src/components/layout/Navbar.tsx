import Link from "next/link";
import { Menu, Search, User, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-space-700 bg-space-900/80 backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <img src="/horoscope-result-1.png" alt="Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gold-500/50 flex-shrink-0" />
          <span className="font-serif text-base sm:text-xl font-bold tracking-wider text-gold-400 hidden xs:block sm:block truncate">
            සුභද්‍රා ජ්‍යෝතිෂ්‍ය
          </span>
        </Link>
        
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          <Link href="/" className="hover:text-gold-400 transition-colors">මුල් පිටුව</Link>
          <Link href="/zodiac" className="hover:text-gold-400 transition-colors">ලග්න විස්තර</Link>
          <Link href="/horoscope/daily" className="hover:text-gold-400 transition-colors">දෛනික පලාපල</Link>
          <Link href="/services" className="hover:text-gold-400 transition-colors">සේවාවන්</Link>
          {session && (
            <>
              {(session as any).user?.role === 'admin' && (
                <Link href="/admin" className="hover:text-gold-400 text-green-400 transition-colors font-bold">Admin Panel</Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button className="p-2 hover:bg-space-800 rounded-full transition-colors hidden md:block">
            <Search className="w-5 h-5" />
          </button>
          
          {session ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href={(session as any).user?.role === 'admin' ? "/admin" : "/profile"} className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                {session.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-gold-500 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-gold-500 flex items-center justify-center bg-space-800 flex-shrink-0">
                    <User className="w-4 h-4 text-gold-400" />
                  </div>
                )}
                <span className="text-sm hidden lg:block">{session.user?.name}</span>
              </Link>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" className="p-2 hover:bg-space-800 rounded-full transition-colors text-red-400 hover:text-red-300">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-2 px-3 py-2 bg-gold-500 hover:bg-gold-400 text-space-900 rounded-full font-medium transition-colors text-sm">
              <User className="w-4 h-4" />
              <span>ඇතුල් වන්න</span>
            </Link>
          )}

          <MobileMenu session={session} />
        </div>
      </div>
    </header>
  );
}
