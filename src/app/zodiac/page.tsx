import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ZODIAC_SIGNS } from "@/lib/zodiacData";

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
          <div key={i} className="group p-6 md:p-8 rounded-2xl bg-space-800/60 backdrop-blur-md border border-space-700 hover:border-gold-500/50 transition-all duration-500 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="text-5xl text-gold-400 group-hover:scale-110 transition-transform duration-300 select-none">
                {sign.iconSymbol}
              </span>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-space-700 text-xs text-gray-300 font-medium mb-1 border border-space-600/30">
                  {sign.element}
                </span>
              </div>
            </div>
            
            <h2 className="text-2xl font-serif font-bold mb-2">{sign.name} ලග්නය</h2>
            <p className="text-gold-300 text-sm mb-4">{sign.date}</p>
            
            <p className="text-gray-400 mb-6 flex-grow leading-relaxed">
              පාලක ග්‍රහයා: <span className="text-white font-semibold">{sign.ruler}</span><br/><br/>
              {sign.personality.substring(0, 110)}...
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
