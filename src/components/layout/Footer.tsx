import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-space-800 border-t border-space-700 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="text-2xl text-gold-400">✨</span>
            <span className="font-serif text-xl font-bold tracking-wider text-gold-400">
              සුභද්‍රා ජ්‍යෝතිෂ්‍ය
            </span>
          </Link>
          <p className="text-sm text-gray-400 max-w-sm mb-6">
            පැරණි ජ්‍යෝතිෂ්‍ය දැනුම සහ නවීන දැක්මක් තුලින් ඔබේ ජීවන ගමනට මග පෙන්වීම. තරු හරහා ඔබේ සැබෑ හැකියාවන් සොයාගන්න.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif text-lg font-semibold text-gold-300 mb-4">ඉක්මන් සබැඳි</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/zodiac" className="hover:text-gold-400 transition-colors">ලග්න විස්තර</Link></li>
            <li><Link href="/horoscope/daily" className="hover:text-gold-400 transition-colors">දෛනික පලාපල</Link></li>
            <li><Link href="/services" className="hover:text-gold-400 transition-colors">අපගේ සේවාවන්</Link></li>
            <li><Link href="/about" className="hover:text-gold-400 transition-colors">අප ගැන</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold text-gold-300 mb-4">අප අමතන්න</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>විද්‍යුත් තැපෑල: info@subadra-astrology.com</li>
            <li>දුරකථන: +1 (555) 123-4567</li>
            <li>ස්ථානය: 123 Starry Lane, Universe City</li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-space-700 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} සුභද්‍රා ආරත්නායක ජ්‍යෝතිෂ්‍ය සේවය. සියලුම හිමිකම් ඇවිරිණි.</p>
      </div>
    </footer>
  );
}
