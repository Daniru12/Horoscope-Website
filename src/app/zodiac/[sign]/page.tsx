import { Calendar, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const ZODIAC_SIGNS = [
  { name: "මේෂ", date: "මාර්තු 21 - අප්‍රේල් 19", icon: "♈", element: "තේජෝ", ruler: "කුජ", urlName: "aries" },
  { name: "වෘෂභ", date: "අප්‍රේල් 20 - මැයි 20", icon: "♉", element: "පඨවි", ruler: "සිකුරු", urlName: "taurus" },
  { name: "මිථුන", date: "මැයි 21 - ජූනි 20", icon: "♊", element: "වායෝ", ruler: "බුධ", urlName: "gemini" },
  { name: "කටක", date: "ජූනි 21 - ජූලි 22", icon: "♋", element: "ආපෝ", ruler: "සඳු", urlName: "cancer" },
  { name: "සිංහ", date: "ජූලි 23 - අගෝස්තු 22", icon: "♌", element: "තේජෝ", ruler: "රවි", urlName: "leo" },
  { name: "කන්‍යා", date: "අගෝස්තු 23 - සැප්තැම්බර් 22", icon: "♍", element: "පඨවි", ruler: "බුධ", urlName: "virgo" },
  { name: "තුලා", date: "සැප්තැම්බර් 23 - ඔක්තෝබර් 22", icon: "♎", element: "වායෝ", ruler: "සිකුරු", urlName: "libra" },
  { name: "වෘශ්චික", date: "ඔක්තෝබර් 23 - නොවැම්බර් 21", icon: "♏", element: "ආපෝ", ruler: "කුජ/ප්ලූටෝ", urlName: "scorpio" },
  { name: "ධනු", date: "නොවැම්බර් 22 - දෙසැම්බර් 21", icon: "♐", element: "තේජෝ", ruler: "ගුරු", urlName: "sagittarius" },
  { name: "මකර", date: "දෙසැම්බර් 22 - ජනවාරි 19", icon: "♑", element: "පඨවි", ruler: "සෙනසුරු", urlName: "capricorn" },
  { name: "කුම්භ", date: "ජනවාරි 20 - පෙබරවාරි 18", icon: "♒", element: "වායෝ", ruler: "සෙනසුරු/යුරේනස්", urlName: "aquarius" },
  { name: "මීන", date: "පෙබරවාරි 19 - මාර්තු 20", icon: "♓", element: "ආපෝ", ruler: "ගුරු/නෙප්චූන්", urlName: "pisces" },
];

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

      <div className="bg-space-800/60 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-space-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-6">
            <div className="flex items-center gap-6 text-center md:text-left">
              <span className="text-7xl text-gold-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                {signData.icon}
              </span>
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{signData.name}</h1>
                <p className="text-gold-400 text-lg">{signData.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-2 rounded-full bg-space-700/80 border border-space-600 text-sm text-gray-300 font-medium">
                {signData.element}
              </span>
              <span className="px-4 py-2 rounded-full bg-space-700/80 border border-space-600 text-sm text-gray-300 font-medium">
                {signData.ruler}
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
              <h3 className="text-xl font-serif font-bold text-white mb-3">පෞරුෂත්වය</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {signData.name} ලග්න හිමියන් ඔවුන්ගේ {signData.element} මූලද්‍රව්‍යයේ සහ {signData.ruler} ග්‍රහයාගේ බලපෑමට අනුව විශේෂිත ලක්ෂණ පෙන්වයි. ඔවුන් සාමාන්‍යයෙන් තීරණ ගැනීමේදී ඉතා දැඩි ප්‍රතිපත්තියක් අනුගමනය කරයි.
              </p>
            </div>
            <div className="bg-space-800/40 rounded-2xl p-6 border border-space-700 hover:border-gold-500/30 transition-colors">
              <h3 className="text-xl font-serif font-bold text-white mb-3">ගැලපෙන ලග්න</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                මෙම ලග්නයට වඩාත්ම ගැලපෙන අන්දමින් ක්‍රියාකරන වෙනත් ලග්න හා මූලද්‍රව්‍ය ඇත. විශේෂයෙන්ම {signData.element === "තේජෝ" ? "වායෝ" : signData.element === "පඨවි" ? "ආපෝ" : signData.element === "වායෝ" ? "තේජෝ" : "පඨවි"} ලග්න හිමියන් සමග මොවුන්ගේ සබඳතා වඩාත් සාර්ථක වේ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
