import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Moon, Sun } from "lucide-react";

const ZODIAC_SIGNS = [
  { name: "මේෂ", date: "මාර්තු 21 - අප්‍රේල් 19", icon: "♈", urlName: "aries" },
  { name: "වෘෂභ", date: "අප්‍රේල් 20 - මැයි 20", icon: "♉", urlName: "taurus" },
  { name: "මිථුන", date: "මැයි 21 - ජූනි 20", icon: "♊", urlName: "gemini" },
  { name: "කටක", date: "ජූනි 21 - ජූලි 22", icon: "♋", urlName: "cancer" },
  { name: "සිංහ", date: "ජූලි 23 - අගෝස්තු 22", icon: "♌", urlName: "leo" },
  { name: "කන්‍යා", date: "අගෝස්තු 23 - සැප්තැම්බර් 22", icon: "♍", urlName: "virgo" },
  { name: "තුලා", date: "සැප්තැම්බර් 23 - ඔක්තෝබර් 22", icon: "♎", urlName: "libra" },
  { name: "වෘශ්චික", date: "ඔක්තෝබර් 23 - නොවැම්බර් 21", icon: "♏", urlName: "scorpio" },
  { name: "ධනු", date: "නොවැම්බර් 22 - දෙසැම්බර් 21", icon: "♐", urlName: "sagittarius" },
  { name: "මකර", date: "දෙසැම්බර් 22 - ජනවාරි 19", icon: "♑", urlName: "capricorn" },
  { name: "කුම්භ", date: "ජනවාරි 20 - පෙබරවාරි 18", icon: "♒", urlName: "aquarius" },
  { name: "මීන", date: "පෙබරවාරි 19 - මාර්තු 20", icon: "♓", urlName: "pisces" },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative py-20 md:py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-space-900/80 z-10"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center"></div>
        </div>

        <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-space-800/80 border border-gold-500/30 text-gold-300 text-sm font-medium mb-8 backdrop-blur-sm">
            <Star className="w-4 h-4" />
            <span>ඔබේ දෛවය සොයාගන්න</span>
            <Star className="w-4 h-4" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif leading-tight">
            තරු පෙන්වන මගෙන් <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">
              ජීවිතය ජයගන්න
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
            සුභද්‍රා ආරත්නායක ජ්‍යෝතිෂ්‍ය සේවයට සාදරයෙන් පිළිගනිමු. සත්‍ය ජ්‍යෝතිෂ්‍ය මාර්ගෝපදේශ තුලින් ඔබේ ජීවිතයේ සැබෑ අරමුණ සහ විශ්වයේ රහස් සොයාගන්න.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/horoscope/daily" className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              දෛනික පලාපල බලන්න
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/services" className="px-8 py-4 bg-space-800 hover:bg-space-700 border border-gold-500/30 text-gold-100 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              වේලාවක් වෙන්කරගන්න
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16 -mt-10 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "දෛනික පලාපල", icon: Sun, desc: "අද දින ඔබගේ පලාපල.", link: "/horoscope/daily" },
            { title: "සතිපතා පලාපල", icon: Moon, desc: "සතියේ ග්‍රහ හැසිරීම් සමගින් සැලසුම් කරන්න.", link: "/horoscope/weekly" },
            { title: "පෞද්ගලික කේන්දර", icon: Star, desc: "ඔබගේ කේන්දරයේ ගැඹුරු විස්තර.", link: "/services" },
          ].map((card, i) => (
            <Link href={card.link} key={i} className="group p-6 rounded-2xl bg-space-800/80 border border-space-700 hover:border-gold-500/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 rounded-full bg-space-700 flex items-center justify-center mb-4 text-gold-400 group-hover:scale-110 transition-transform">
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2 text-white">{card.title}</h3>
              <p className="text-gray-400 mb-4">{card.desc}</p>
              <div className="text-gold-400 font-medium flex items-center gap-1 text-sm">
                තවදුරටත් <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Zodiac Signs Grid */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">ඔබගේ ලග්නය තෝරන්න</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">ඔබගේ දෛනික පලාපල සහ සුවිශේෂී ලක්ෂණ දැනගැනීම සඳහා ඔබගේ ලග්නය තෝරන්න.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {ZODIAC_SIGNS.map((sign, i) => (
            <Link href={`/zodiac/${sign.urlName}`} key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-space-800/40 border border-space-700 hover:bg-space-700 hover:border-gold-500/30 transition-all duration-300 group">
              <span className="text-4xl mb-3 group-hover:scale-125 group-hover:text-gold-400 transition-all duration-300">
                {sign.icon}
              </span>
              <h3 className="font-serif font-bold text-lg">{sign.name}</h3>
              <p className="text-xs text-gray-500">{sign.date}</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/zodiac" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium transition-colors">
            සියලුම ලග්න විස්තර බලන්න <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
