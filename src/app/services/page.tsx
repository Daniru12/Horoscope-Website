import Link from "next/link";
import { Star, Heart, Book, Sparkles, ArrowRight, Clock, ListChecks, Upload, FileText, MessageCircle } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Service from "@/models/Service";
import Reveal from "@/components/Reveal";
import SpotlightLink from "@/components/SpotlightLink";

const ICON_MAP: Record<string, typeof Star> = { Star, Heart, Book, Sparkles };

const DEFAULT_SERVICES = [
  {
    title: "පෞද්ගලික කේන්දර පරීක්ෂාව",
    description: "ඔබේ ජීවන ගමන් මග, ශක්තීන්, අභියෝග සහ අනාගත අවස්ථාවන් අනාවරණය කර ගැනීම සඳහා ඔබේ කේන්දරය පිළිබඳ පුළුල් විශ්ලේෂණයක්.",
    price: "රු. 3000",
    duration: "විනාඩි 60",
    iconName: "Star",
  },
  {
    title: "පොරොන්දම් ගැලපීම",
    description: "සාමකාමී, දිගුකාලීන සහ සමෘද්ධිමත් විවාහ ජීවිතයක් සහතික කිරීම සඳහා සහකරුවන් අතර ගැළපීම පිළිබඳ ගැඹුරු විශ්ලේෂණයක්.",
    price: "රු. 4500",
    duration: "විනාඩි 90",
    iconName: "Heart",
  },
  {
    title: "නාමකරණය සහ අංක විද්‍යාව",
    description: "ඔබේ නමේ සැඟවුණු බලපෑම සහ උපරිම සාර්ථකත්වය සඳහා ඔබේ උපන් දිනය සමඟ එය පරිපූර්ණ ලෙස පෙළගස්වන්නේ කෙසේදැයි සොයා ගන්න.",
    price: "රු. 2500",
    duration: "විනාඩි 45",
    iconName: "Book",
  },
  {
    title: "වාර්ෂික පලාපල",
    description: "රැකියාව, ආදරය, සෞඛ්‍යය සහ ධනය සම්බන්ධයෙන් ඉදිරි වසරේ මාසෙන් මාසයට ඔබට ලැබෙන්නේ කුමක්ද යන්න පිළිබඳව.",
    price: "රු. 4000",
    duration: "විනාඩි 60",
    iconName: "Sparkles",
  },
];

/** The real booking flow on this site, in order. */
const STEPS = [
  { icon: ListChecks, title: "සේවාව තෝරන්න", text: "ඔබට අවශ්‍ය කියවීම තෝරා “වෙන්කරවා ගන්න” ඔබන්න." },
  { icon: Clock, title: "උපත් විස්තර ලබාදෙන්න", text: "උපන් දිනය, වේලාව සහ ස්ථානය ඇතුළත් කරන්න." },
  { icon: Upload, title: "ගෙවීම් රිසිට්පත යවන්න", text: "බැංකු ගෙවීම කර රිසිට්පතේ ඡායාරූපය උඩුගත කරන්න." },
  { icon: FileText, title: "පලාපල වාර්තාව ලබාගන්න", text: "ඔබේ වාර්තාව ඔබගේ ගිණුමේ (Profile) පිටුවට ලැබේ." },
];

type ServiceItem = { id: string; title: string; description: string; price: string; duration: string; iconName?: string };

async function getServices(): Promise<ServiceItem[] | null> {
  try {
    await connectToDatabase();
    let docs = await Service.find({ isActive: { $ne: false } }).sort({ createdAt: 1 }).lean();
    if (docs.length === 0) {
      // First run: seed the default services so the page is never empty.
      await Service.insertMany(DEFAULT_SERVICES);
      docs = await Service.find({ isActive: { $ne: false } }).sort({ createdAt: 1 }).lean();
    }
    return docs.map((s: any) => ({
      id: String(s._id),
      title: s.title,
      description: s.description,
      price: s.price,
      duration: s.duration,
      iconName: s.iconName,
    }));
  } catch (error) {
    console.error("Failed to load services:", error);
    return null;
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-24">
      {/* Header */}
      <Reveal>
        <header className="max-w-2xl mb-14 sm:mb-16">
          <span className="eyebrow mb-5">ජ්‍යෝතිෂ්‍ය සේවාවන්</span>
          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.15] mb-6">
            ඔබට ගැලපෙන <span className="text-gold-gradient">කියවීම</span> තෝරන්න
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            සුභද්‍රා රත්නායක මහත්මියගේ විශේෂඥ මාර්ගෝපදේශය. ඔබේ ජීවන ගමනට පැහැදිලි බවක් සහ දිශාවක් ලබා ගැනීමට පෞද්ගලික උපදේශනයක් වෙන්කරවා ගන්න.
          </p>
        </header>
      </Reveal>

      {/* Services */}
      {services === null ? (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-white font-semibold mb-2">සේවාවන් මේ මොහොතේ පූරණය කළ නොහැක.</p>
          <p className="text-gray-400 mb-6">කරුණාකර මඳ වේලාවකින් නැවත උත්සාහ කරන්න, නැතහොත් අප අමතන්න.</p>
          <Link href="/contact" className="btn-ghost">
            අප අමතන්න
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((s, i) => {
            const Icon = ICON_MAP[s.iconName || ""] || Sparkles;
            return (
              <Reveal key={s.id} delay={(i % 2) * 0.08}>
                <SpotlightLink
                  href={`/service-request?serviceId=${s.id}`}
                  className="group glass rounded-[1.75rem] p-7 sm:p-8 flex flex-col h-full transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-8">
                    <span className="w-14 h-14 rounded-2xl grid place-items-center bg-gold-500/10 text-gold-300 ring-1 ring-gold-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                      <Icon className="w-7 h-7" />
                    </span>
                    <span className="font-serif text-5xl leading-none text-white/[0.07] group-hover:text-gold-400/25 transition-colors duration-500 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h2 className="font-serif font-bold text-2xl sm:text-[1.7rem] leading-snug text-white mb-3">{s.title}</h2>
                  <p className="text-gray-400 leading-relaxed mb-8">{s.description}</p>

                  <div className="mt-auto pt-6 border-t border-[var(--hairline)] flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                    <div className="flex sm:block items-baseline justify-between gap-3">
                      <span className="block font-serif text-3xl text-gold-gradient leading-none sm:mb-2">{s.price}</span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 whitespace-nowrap">
                        <Clock className="w-4 h-4" /> {s.duration} සැසිය
                      </span>
                    </div>
                    <span className="btn-gold !py-3 !px-5 text-sm shrink-0 w-full sm:w-auto">
                      වෙන්කරවා ගන්න
                      <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                    </span>
                  </div>
                </SpotlightLink>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* How booking works */}
      <section className="mt-24 sm:mt-32">
        <Reveal>
          <div className="max-w-xl mb-12">
            <span className="eyebrow mb-5">වෙන්කරවා ගන්නා ආකාරය</span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">සරල පියවර හතරක්</h2>
          </div>
        </Reveal>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} as="li" delay={i * 0.08}>
              <div className="relative h-full rounded-3xl border border-[var(--hairline)] p-6 bg-space-900/40">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-9 h-9 rounded-full grid place-items-center bg-gold-400 text-space-900 font-bold text-sm">{i + 1}</span>
                  <step.icon className="w-5 h-5 text-gold-300" />
                </div>
                <h3 className="font-serif font-bold text-xl text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Not sure? */}
      <Reveal>
        <section className="mt-24 sm:mt-32 glass rounded-[2rem] px-6 py-12 sm:px-14 sm:py-16 relative overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-14">
            <div className="flex-1">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl leading-tight mb-4">
                ඔබට ගැලපෙන සේවාව කුමක්දැයි <span className="text-gold-gradient">විශ්වාස නැද්ද?</span>
              </h2>
              <p className="text-gray-300 leading-relaxed max-w-xl">
                ඔබේ නිශ්චිත අවශ්‍යතා සහ ප්‍රශ්න සඳහා වඩාත්ම සුදුසු ජ්‍යෝතිෂ්‍ය සේවාව තීරණය කිරීමට, කෙටි මිනිත්තු 10ක සාකච්ඡාවක් සඳහා අප හා සම්බන්ධ වන්න.
              </p>
            </div>
            <Link href="/contact" className="btn-gold shrink-0 self-start lg:self-auto">
              <MessageCircle className="w-5 h-5" /> අප අමතන්න
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
