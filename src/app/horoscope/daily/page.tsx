"use client";

import { useState } from "react";
import { Calendar, Share2 } from "lucide-react";

const ZODIAC_SIGNS = ["මේෂ", "වෘෂභ", "මිථුන", "කටක", "සිංහ", "කන්‍යා", "තුලා", "වෘශ්චික", "ධනු", "මකර", "කුම්භ", "මීන"];

export default function DailyHoroscopePage() {
  const [activeSign, setActiveSign] = useState("මේෂ");
  
  // Mock data for MVP
  const horoscopeText = `අද දින ${activeSign} ලග්න හිමියන්ට ප්‍රබල විශ්වීය ශක්තියක් ගෙන එයි. ග්‍රහ පිහිටීම් වලට අනුව ඔබේ පෞද්ගලික අරමුණු කෙරෙහි අවධානය යොමු කිරීමටත්, සැක සංකා දුරු කර ගැනීමටත් මෙය කදිම කාලයකි. ඔබේ පාලක ග්‍රහයා ශුභ දෘෂ්ටියක් ඇති කරන බැවින් අද දහවල් කාලයේ තීරණ ගැනීමේදී ඔබේ සහජ බුද්ධිය විශ්වාස කරන්න. මූල්‍යමය වශයෙන්, ප්‍රවේශම් වන්න නමුත් ශුභවාදී වන්න. සබඳතා වලදී, පැහැදිලි සන්නිවේදනය මගින් මෑත කාලීන වරදවා වටහාගැනීම් දුරු වනු ඇත.`;

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">දෛනික පලාපල</h1>
        <div className="flex items-center justify-center gap-2 text-gold-400">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">{new Date().toLocaleDateString('si-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sign Selector Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-space-800/50 rounded-2xl p-4 border border-space-700 sticky top-24">
            <h3 className="font-serif text-lg font-semibold mb-4 text-white px-2">ලග්නය තෝරන්න</h3>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0 scrollbar-hide">
              {ZODIAC_SIGNS.map(sign => (
                <button
                  key={sign}
                  onClick={() => setActiveSign(sign)}
                  className={`px-4 py-3 rounded-xl text-left whitespace-nowrap transition-all duration-300 font-medium ${
                    activeSign === sign 
                      ? "bg-gold-500 text-space-900 shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                      : "text-gray-400 hover:bg-space-700 hover:text-white"
                  }`}
                >
                  {sign}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full lg:w-3/4">
          <div className="bg-space-800/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-space-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-white mb-2">{activeSign}</h2>
                  <p className="text-gold-400 font-medium">ඔබගේ දෛනික පලාපල</p>
                </div>
                <button className="p-3 bg-space-700 hover:bg-space-600 rounded-full text-white transition-colors" title="Share your horoscope">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-gray-300 mb-8">
                  {horoscopeText}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-space-700">
                <div className="bg-space-900/50 rounded-xl p-4 text-center border border-space-700/50">
                  <span className="block text-sm text-gray-400 mb-1">ශුභ වර්ණය</span>
                  <span className="font-semibold text-white">තද නිල්</span>
                </div>
                <div className="bg-space-900/50 rounded-xl p-4 text-center border border-space-700/50">
                  <span className="block text-sm text-gray-400 mb-1">ශුභ අංකය</span>
                  <span className="font-semibold text-white">7</span>
                </div>
                <div className="bg-space-900/50 rounded-xl p-4 text-center border border-space-700/50">
                  <span className="block text-sm text-gray-400 mb-1">මනෝභාවය</span>
                  <span className="font-semibold text-white">උද්‍යෝගිමත්</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
