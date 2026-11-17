import Link from "next/link";
import { ArrowRight, Sun, Star, Heart } from "lucide-react";
import Reveal from "@/components/Reveal";
import SpotlightLink from "@/components/SpotlightLink";
import { ZODIAC_SIGNS } from "@/lib/zodiacData";
import VideoBackground from "@/components/VideoBackground";

const OFFERINGS = [
  { no: "01", title: "දෛනික පලාපල", icon: Sun, desc: "අද දින ග්‍රහ පිහිටීම් ඔබේ ලග්නයට බලපාන ආකාරය.", link: "/horoscope/daily" },
  { no: "02", title: "ලග්න විස්තර", icon: Star, desc: "සෑම ලග්නයකම ලක්ෂණ, ශක්තීන් සහ පාලක ග්‍රහයා.", link: "/zodiac" },
  { no: "03", title: "පෞද්ගලික කේන්දර", icon: Heart, desc: "ඔබේ උපන් වේලාවට අනුව ගැඹුරු, පෞද්ගලික විග්‍රහයක්.", link: "/services" },
];

const FACTS = [
  { k: "වසර 20+", v: "පළපුරුද්ද" },
  { k: "වෛදික • බටහිර", v: "ජ්‍යෝතිෂ්‍ය සම්ප්‍රදාය" },
  { k: "පෞද්ගලික", v: "කියවීම් සහ උපදේශනය" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero — the 3D armillary sphere (CosmicScene) lives behind this */}
      <section className="relative w-full min-h-[calc(100svh-68px)] flex items-center">
        {/* Video sits below the 3D canvas (z -20 < -1); overlays keep the headline readable */}
        <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
          <VideoBackground />
          <div className="absolute inset-0 bg-space-900/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-space-900/90 via-space-900/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-space-900" />
        </div>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="max-w-2xl">
            <Reveal y={16}>
              <span className="eyebrow mb-8">සුභද්‍රා රත්නායක ජ්‍යෝතිෂ්‍ය සේවය</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="font-serif font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.15] mb-8">
                තරු පෙන්වන මගෙන්
                <br />
                <span className="text-gold-gradient">ජීවිතය ජයගන්න</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10 max-w-xl">
                සත්‍ය ජ්‍යෝතිෂ්‍ය මාර්ගෝපදේශ තුළින් ඔබේ ජීවිතයේ සැබෑ අරමුණ සහ විශ්වයේ රහස් සොයාගන්න.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/horoscope/daily" className="btn-gold">
                  දෛනික පලාපල බලන්න
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/services" className="btn-ghost">වේලාවක් වෙන්කරවා ගන්න</Link>
              </div>
            </Reveal>
            <Reveal delay={0.45}>
              <dl className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-[var(--hairline)]">
                {FACTS.map((f) => (
                  <div key={f.k}>
                    <dt className="font-serif text-xl text-gold-300">{f.k}</dt>
                    <dd className="text-sm text-gray-400 mt-1">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 text-xs tracking-[0.2em] text-gray-500">
          <span>පහළට</span>
          <span className="scroll-cue" />
        </div>
      </section>

      {/* What you can do */}
      <section className="w-full">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <Reveal>
            <div className="max-w-xl mb-14">
              <span className="eyebrow mb-5">ආරම්භ කරන්න</span>
              <h2 className="font-serif font-bold text-4xl md:text-5xl leading-tight">ඔබට අවශ්‍ය මග තෝරන්න</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OFFERINGS.map((o, i) => (
              <Reveal key={o.no} delay={i * 0.1}>
                <SpotlightLink href={o.link} className="group glass flex flex-col h-full rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1.5">
                  <div className="flex items-start justify-between mb-12">
                    <span className="w-12 h-12 rounded-2xl grid place-items-center bg-gold-500/10 text-gold-300 ring-1 ring-gold-500/30">
                      <o.icon className="w-6 h-6" />
                    </span>
                    <span className="font-serif text-4xl text-white/10 group-hover:text-gold-400/40 transition-colors duration-500">{o.no}</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-3">{o.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-8">{o.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-2 text-gold-300 font-medium">
                    තවදුරටත්
                    <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                  </span>
                </SpotlightLink>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Zodiac */}
      <section className="w-full">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-24">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="eyebrow mb-5">දොළොස් ලග්න</span>
              <h2 className="font-serif font-bold text-4xl md:text-5xl mb-5">ඔබගේ ලග්නය තෝරන්න</h2>
              <p className="text-gray-400 text-lg">ඔබගේ දෛනික පලාපල සහ සුවිශේෂී ලක්ෂණ දැනගැනීම සඳහා ඔබගේ ලග්නය තෝරන්න.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {ZODIAC_SIGNS.map((sign, i) => (
              <Reveal key={sign.urlName} delay={(i % 4) * 0.07}>
                <SpotlightLink href={`/zodiac/${sign.urlName}`} className="group glass flex flex-col items-center text-center rounded-3xl px-4 py-8 sm:py-10 transition-all duration-500 hover:-translate-y-1.5">
                  <span className="glyph text-5xl sm:text-6xl text-gold-400/90 mb-5 transition-all duration-500 group-hover:scale-110 group-hover:text-gold-300 group-hover:drop-shadow-[0_0_18px_rgba(231,198,90,0.55)]" aria-hidden="true">
                    {sign.iconSymbol}&#xFE0E;
                  </span>
                  <h3 className="font-serif font-bold text-xl">{sign.name}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{sign.date}</p>
                </SpotlightLink>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="text-center mt-12">
              <Link href="/zodiac" className="btn-ghost">සියලුම ලග්න විස්තර බලන්න <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing call */}
      <section className="w-full">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-12 pb-28">
          <Reveal>
            <div className="glass rounded-[2rem] px-6 py-16 sm:px-16 text-center relative overflow-hidden">
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
              <div className="relative">
                <h2 className="font-serif font-bold text-3xl sm:text-5xl leading-tight mb-5">
                  ඔබේ කේන්දරය කියවීමට <span className="text-gold-gradient">සූදානම්ද?</span>
                </h2>
                <p className="text-gray-300 text-lg max-w-xl mx-auto mb-10">පෞද්ගලික උපදේශනයක් වෙන්කරවා ගෙන ඔබේ ඉදිරි මාවත පැහැදිලි කරගන්න.</p>
                <Link href="/services" className="btn-gold">සේවාවන් බලන්න <ArrowRight className="w-5 h-5" /></Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
