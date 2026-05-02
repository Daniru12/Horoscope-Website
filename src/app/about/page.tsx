import Image from "next/image";
import { Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        
        {/* Profile Image Column */}
        <div className="w-full md:w-5/12 relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden relative border-2 border-gold-500/30">
            {/* Placeholder for astrologer image */}
            <div className="absolute inset-0 bg-space-800 flex items-center justify-center">
              <span className="text-6xl">👤</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 bg-gold-500 text-space-900 p-6 rounded-2xl shadow-xl hidden md:block">
            <span className="block text-3xl font-bold font-serif">20+</span>
            <span className="text-sm font-medium">වසරක පළපුරුද්ද</span>
          </div>
        </div>
        
        {/* Content Column */}
        <div className="w-full md:w-7/12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-800 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Star className="w-3 h-3" /> ජ්‍යෝතිෂවේදියා ගැන
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
            සුභද්‍රා ආරත්නායක
          </h1>
          
          <div className="prose prose-invert max-w-none text-gray-300">
            <p className="text-lg leading-relaxed mb-6">
              මගේ විශ්වීය අභයභූමියට සාදරයෙන් පිළිගනිමු. වෛදික සහ බටහිර ජ්‍යෝතිෂ්‍ය පිළිබඳ දශක දෙකකට අධික කැපවූ අධ්‍යයනය සහ පුහුණුව සමඟින්, මගේ මෙහෙවර වන්නේ තරු වල ප්‍රඥාව හරහා පුද්ගලයන්ට ඔවුන්ගේ ජීවිතයේ සංකීර්ණ මාවත් වල සැරිසැරීමට උපකාර කිරීමයි.
            </p>
            
            <p className="leading-relaxed mb-6">
              ජ්‍යෝතිෂ්‍ය අනාගතය පුරෝකථනය කිරීමට වඩා වැඩි දෙයකි; එය ස්වයං-සොයාගැනීම සහ සවිබල ගැන්වීම සඳහා වන ප්‍රබල මෙවලමකි. ඔබ ඉපදුණු මොහොතේම ඇති සුවිශේෂී ග්‍රහ පිහිටීම් අවබෝධ කර ගැනීමෙන්, අපට ඔබේ සැඟවුණු හැකියාවන් විවෘත කිරීමට, ඔබේ ගැඹුරුම අභියෝග තේරුම් ගැනීමට සහ ඉදිරි මාවත ආලෝකමත් කිරීමට හැකිය.
            </p>
            
            <div className="bg-space-800/50 border-l-4 border-gold-500 p-6 rounded-r-xl my-8">
              <p className="text-white font-serif text-xl italic m-0">
                "තරු අපගේ ඉරණම නියම නොකරයි, ඒවා අපගේ තේරීම් ආලෝකමත් කරයි. අපගේ සැබෑ බලය රඳා පවතින්නේ අප විශ්වීය තත්වයන්ට ප්‍රතිචාර දක්වන ආකාරය මත ය."
              </p>
            </div>
            
            <p className="leading-relaxed mb-6">
              ඔබ ඔබේ වෘත්තියේ පැහැදිලි බවක් අපේක්ෂා කරන්නේද, ඔබේ සහකරුවා සොයමින් සිටියද, නැතහොත් ඔබව වඩාත් හොඳින් අවබෝධ කර ගැනීමට අවශ්‍ය වුවද, මගේ පෞද්ගලීකරණය කළ කියවීම් විශේෂයෙන් ඔබට ගැලපෙන ප්‍රායෝගික, ක්‍රියාකාරී අවබෝධයක් ලබා දෙයි.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
