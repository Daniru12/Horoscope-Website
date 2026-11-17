import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export default async function Footer() {
  let settings: any = {};
  try {
    await connectToDatabase();
    settings = (await Setting.findOne()) || {};
  } catch (error) {
    console.error("Failed to fetch settings for footer:", error);
  }

  const email = settings.email || "info@subadra-astrology.com";
  const mobileNumber = settings.mobileNumber || "+94 711 038 064";

  return (
    <footer className="relative mt-auto border-t border-[var(--hairline)] bg-space-900/70 backdrop-blur-md pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-12">
        <div className="md:col-span-6">
          <Link href="/" className="flex items-center gap-3 mb-5">
            <img
              src="/horoscope-result-1.png"
              alt="සුභද්‍රා ජ්‍යෝතිෂ්‍ය ලාංඡනය"
              className="w-11 h-11 rounded-full object-cover ring-1 ring-gold-500/50 ring-offset-2 ring-offset-space-900"
            />
            <span className="font-serif text-2xl font-bold tracking-wide text-gold-gradient">සුභද්‍රා ජ්‍යෝතිෂ්‍ය</span>
          </Link>
          <p className="text-gray-400 max-w-md leading-relaxed">
            පැරණි ජ්‍යෝතිෂ්‍ය දැනුම සහ නවීන දැක්මක් තුළින් ඔබේ ජීවන ගමනට මග පෙන්වීම. තරු හරහා ඔබේ සැබෑ හැකියාවන් සොයාගන්න.
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-serif text-lg text-gold-300 mb-5">ඉක්මන් සබැඳි</h4>
          <ul className="space-y-3 text-gray-400">
            <li><Link href="/zodiac" className="hover:text-gold-300 transition-colors">ලග්න විස්තර</Link></li>
            <li><Link href="/horoscope/daily" className="hover:text-gold-300 transition-colors">දෛනික පලාපල</Link></li>
            <li><Link href="/services" className="hover:text-gold-300 transition-colors">අපගේ සේවාවන්</Link></li>
            <li><Link href="/about" className="hover:text-gold-300 transition-colors">අප ගැන</Link></li>
            <li><Link href="/contact" className="hover:text-gold-300 transition-colors">අප අමතන්න</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="font-serif text-lg text-gold-300 mb-5">අප අමතන්න</h4>
          <ul className="space-y-3 text-gray-400">
            <li className="break-all">
              <span className="block text-xs tracking-wider text-gray-500 mb-0.5">විද්‍යුත් තැපෑල</span>
              {email}
            </li>
            <li>
              <span className="block text-xs tracking-wider text-gray-500 mb-0.5">දුරකථන</span>
              {mobileNumber}
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 border-t border-[var(--hairline)] text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} සුභද්‍රා රත්නායක ජ්‍යෝතිෂ්‍ය සේවය. සියලුම හිමිකම් ඇවිරිණි.</p>
      </div>
    </footer>
  );
}
