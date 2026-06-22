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
  const mobileNumber = settings.mobileNumber || "+1 (555) 123-4567";

  return (
    <footer className="bg-space-800 border-t border-space-700 pt-10 pb-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-1 sm:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <img src="/horoscope-result-1.png" alt="Logo" className="w-10 h-10 rounded-full object-cover border border-gold-500/50 flex-shrink-0" />
            <span className="font-serif text-lg font-bold tracking-wider text-gold-400">
              සුභද්‍රා ජ්‍යෝතිෂ්‍ය
            </span>
          </Link>
          <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
            පැරණි ජ්‍යෝතිෂ්‍ය දැනුම සහ නවීන දැක්මක් තුලින් ඔබේ ජීවන ගමනට මග පෙන්වීම. තරු හරහා ඔබේ සැබෑ හැකියාවන් සොයාගන්න.
          </p>
        </div>
        
        <div>
          <h4 className="font-serif text-base font-semibold text-gold-300 mb-4">ඉක්මන් සබැඳි</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/zodiac" className="hover:text-gold-400 transition-colors">ලග්න විස්තර</Link></li>
            <li><Link href="/horoscope/daily" className="hover:text-gold-400 transition-colors">දෛනික පලාපල</Link></li>
            <li><Link href="/services" className="hover:text-gold-400 transition-colors">අපගේ සේවාවන්</Link></li>
            <li><Link href="/about" className="hover:text-gold-400 transition-colors">අප ගැන</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-base font-semibold text-gold-300 mb-4">අප අමතන්න</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="break-all">විද්‍යුත් තැපෑල: {email}</li>
            <li>දුරකථන: {mobileNumber}</li>
                      </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-10 pt-6 border-t border-space-700 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} සුභද්‍රා ආරත්නායක ජ්‍යෝතිෂ්‍ය සේවය. සියලුම හිමිකම් ඇවිරිණි.</p>
      </div>
    </footer>
  );
}

