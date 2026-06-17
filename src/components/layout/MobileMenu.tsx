"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, X, User, LogOut } from "lucide-react";

export default function MobileMenu({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <button 
        onClick={toggleMenu} 
        className="p-2 hover:bg-space-800 rounded-full transition-colors z-50 relative"
      >
        {isOpen ? <X className="w-6 h-6 text-gold-400" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-[64px] left-0 w-full bg-space-900/95 backdrop-blur-xl border-b border-space-700 p-4 flex flex-col gap-4 shadow-2xl origin-top animate-in slide-in-from-top-2 duration-300 z-40">
          <nav className="flex flex-col gap-4 text-base font-medium">
            <Link href="/" onClick={closeMenu} className="hover:text-gold-400 transition-colors py-2 border-b border-space-800">මුල් පිටුව</Link>
            <Link href="/zodiac" onClick={closeMenu} className="hover:text-gold-400 transition-colors py-2 border-b border-space-800">ලග්න විස්තර</Link>
            <Link href="/horoscope/daily" onClick={closeMenu} className="hover:text-gold-400 transition-colors py-2 border-b border-space-800">දෛනික පලාපල</Link>
            <Link href="/services" onClick={closeMenu} className="hover:text-gold-400 transition-colors py-2 border-b border-space-800">සේවාවන්</Link>
            {session && session.user?.role === 'admin' && (
              <Link href="/admin" onClick={closeMenu} className="hover:text-gold-400 text-green-400 transition-colors font-bold py-2 border-b border-space-800">Admin Panel</Link>
            )}
          </nav>

          <div className="pt-4 flex flex-col gap-4">
            {session ? (
              <div className="flex flex-col gap-3">
                <Link href={session.user?.role === 'admin' ? "/admin" : "/profile"} onClick={closeMenu} className="flex items-center gap-3 hover:text-gold-400 transition-colors p-3 bg-space-800 rounded-xl">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="Profile" className="w-10 h-10 rounded-full border border-gold-500" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-gold-500 flex items-center justify-center bg-space-700">
                      <User className="w-5 h-5 text-gold-400" />
                    </div>
                  )}
                  <span className="font-semibold text-white">{session.user?.name}</span>
                </Link>
                <button 
                  onClick={() => {
                    closeMenu();
                    signOut();
                  }}
                  className="flex items-center justify-center gap-2 w-full p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>ඉවත් වන්න (Sign Out)</span>
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={closeMenu} className="flex justify-center items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-space-900 rounded-xl font-bold transition-colors w-full">
                <User className="w-5 h-5" />
                <span>ඇතුල් වන්න (Sign In)</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
