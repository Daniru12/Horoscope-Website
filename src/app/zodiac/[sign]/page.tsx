import { Calendar, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZODIAC_SIGNS } from "@/lib/zodiacData";

async function translateToSinhala(text: string) {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=si&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    let translatedText = "";
    if (data && data[0]) {
      data[0].forEach((item: any) => {
        if (item[0]) translatedText += item[0];
      });
    }
    return translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

async function getDailyHoroscope(sign: string) {
  try {
    const res = await fetch(`https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${sign}&day=today`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data?.data?.horoscope) {
      const translated = await translateToSinhala(data.data.horoscope);
      return translated;
    }
    return null;
  } catch (error) {
    console.error("Horoscope API error:", error);
    return null;
  }
}

export default async function ZodiacSignPage({ params }: { params: Promise<{ sign: string }> }) {
  const resolvedParams = await params;
  const signParam = resolvedParams.sign;
  const signData = ZODIAC_SIGNS.find(s => s.urlName === signParam);

  if (!signData) {
    notFound();
  }

  const horoscopeText = await getDailyHoroscope(signParam) || `අද දින ${signData.name} ලග්න හිමියන්ට ප්‍රබල විශ්වීය ශක්තියක් ගෙන එයි. ග්‍රහ පිහිටීම් වලට අනුව ඔබේ පෞද්ගලික අරමුණු කෙරෙහි අවධානය යොමු කිරීමටත්, සැක සංකා දුරු කර ගැනීමටත් මෙය කදිම කාලයකි.`;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Link href="/zodiac" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> සියලුම ලග්න වෙත
      </Link>

      <div className="bg-space-800/60 backdrop-blur-md rounded-3xl p-6 md:p-12 border border-space-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-6">
            <div className="flex items-center gap-6 text-center md:text-left">
              <span className="text-7xl text-gold-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] select-none">
                {signData.iconSymbol}
              </span>
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{signData.name} ලග්නය</h1>
                <p className="text-gold-400 text-lg">{signData.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 rounded-full bg-space-700/80 border border-space-600 text-sm text-gray-300 font-medium">
                මූලද්‍රව්‍යය: {signData.element}
              </span>
              <span className="px-4 py-2 rounded-full bg-space-700/80 border border-space-600 text-sm text-gray-300 font-medium">
                පාලකයා: {signData.ruler}
              </span>
            </div>
          </div>
          
          <div className="bg-space-900/50 rounded-2xl p-6 md:p-8 border border-space-700/50 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 text-gold-400">
                <Calendar className="w-5 h-5" />
                <h2 className="text-xl font-serif font-semibold">අද දින පලාපල</h2>
                <span className="text-sm text-gray-400 ml-2 hidden sm:inline-block">
                  {new Date().toLocaleDateString('si-LK', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <button className="p-2 bg-space-800 hover:bg-space-700 rounded-full text-gray-300 hover:text-white transition-colors" title="Share your horoscope">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-gray-200">
                {horoscopeText}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-space-800/40 rounded-2xl p-6 border border-space-700 hover:border-gold-500/30 transition-colors">
              <h3 className="text-xl font-serif font-bold text-white mb-3">පෞරුෂත්වය (Personality)</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {signData.personality}
              </p>
            </div>
            <div className="bg-space-800/40 rounded-2xl p-6 border border-space-700 hover:border-gold-500/30 transition-colors">
              <h3 className="text-xl font-serif font-bold text-white mb-3">ගැළපීම් (Compatibility)</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {signData.compatibility}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
