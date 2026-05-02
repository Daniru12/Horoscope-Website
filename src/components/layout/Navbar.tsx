import Link from "next/link";
import { Menu, Search, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-space-700 bg-space-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl text-gold-400">✨</span>
          <span className="font-serif text-xl font-bold tracking-wider text-gold-400">
            සුභද්‍රා ජ්‍යෝතිෂ්‍ය
          </span>
        </Link>
        
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          <Link href="/" className="hover:text-gold-400 transition-colors">මුල් පිටුව</Link>
          <Link href="/zodiac" className="hover:text-gold-400 transition-colors">ලග්න විස්තර</Link>
          <Link href="/horoscope/daily" className="hover:text-gold-400 transition-colors">දෛනික පලාපල</Link>
          <Link href="/services" className="hover:text-gold-400 transition-colors">සේවාවන්</Link>
          <Link href="/blog" className="hover:text-gold-400 transition-colors">ලිපි</Link>
          <Link href="/contact" className="hover:text-gold-400 transition-colors">අප අමතන්න</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-space-800 rounded-full transition-colors hidden md:block">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-space-800 rounded-full transition-colors hidden md:block">
            <User className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-space-800 rounded-full transition-colors md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
