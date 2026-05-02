import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

export default function ZodiacPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">ලග්න විස්තරය</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          සෑම ලග්නයකම ඇති සුවිශේෂී ලක්ෂණ, ශක්තීන් සහ පාලක ග්‍රහයන් ගැන දැනගන්න.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {ZODIAC_SIGNS.map((sign, i) => (
          <div key={i} className="group p-8 rounded-2xl bg-space-800/60 border border-space-700 hover:border-gold-500/50 transition-all duration-500 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl text-gold-400 group-hover:scale-110 transition-transform duration-300">
                {sign.icon}
              </span>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-space-700 text-xs text-gray-300 font-medium mb-1">
                  {sign.element}
                </span>
              </div>
            </div>
            
            <h2 className="text-2xl font-serif font-bold mb-2">{sign.name}</h2>
            <p className="text-gold-300 text-sm mb-4">{sign.date}</p>
            
            <p className="text-gray-400 mb-6 flex-grow">
              පාලක ග්‍රහයා: <span className="text-white">{sign.ruler}</span><br/><br/>
              ඔවුන්ගේ සුවිශේෂී පෞරුෂත්වය සඳහා ප්‍රසිද්ධ, {sign.name} ලග්න හිමියන් ඔවුන්ගේ පාලක ග්‍රහයා සහ මූලද්‍රව්‍ය මගින් ගැඹුරින් බලපෑමට ලක් වේ.
            </p>
            
            <Link href={`/zodiac/${sign.urlName}`} className="inline-flex items-center gap-2 text-gold-400 font-medium hover:text-gold-300 transition-colors mt-auto group-hover:translate-x-2 duration-300">
              {sign.name} විස්තරය කියවන්න <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
