import Link from "next/link";
import { Star, Heart, Book, Sparkles, ArrowRight } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Service from "@/models/Service";

// Icon mapping dictionary
const ICON_MAP: Record<string, any> = {
  Star,
  Heart,
  Book,
  Sparkles
};

const getIcon = (iconName?: string) => {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  return Sparkles;
};

export default async function ServicesPage() {
  await connectToDatabase();
  let services = await Service.find({ isActive: { $ne: false } }).sort({ createdAt: 1 });

  if (services.length === 0) {
    // Seed default services
    const DEFAULT_SERVICES = [
      {
        title: "පෞද්ගලික කේන්දර පරීක්ෂාව",
        description: "ඔබේ ජීවන ගමන් මග, ශක්තීන්, අභියෝග සහ අනාගත අවස්ථාවන් අනාවරණය කර ගැනීම සඳහා ඔබේ කේන්දරය පිළිබඳ පුළුල් විශ්ලේෂණයක්.",
        price: "රු. 3000",
        duration: "විනාඩි 60",
        iconName: "Star"
      },
      {
        title: "පොරොන්දම් ගැලපීම",
        description: "සාමකාමී, දිගුකාලීන සහ සමෘද්ධිමත් විවාහ ජීවිතයක් සහතික කිරීම සඳහා සහකරුවන් අතර ගැළපීම පිළිබඳ ගැඹුරු විශ්ලේෂණයක්.",
        price: "රු. 4500",
        duration: "විනාඩි 90",
        iconName: "Heart"
      },
      {
        title: "නාමකරණය සහ අංක විද්‍යාව",
        description: "ඔබේ නමේ සැඟවුණු බලපෑම සහ උපරිම සාර්ථකත්වය සඳහා ඔබේ උපන් දිනය සමඟ එය පරිපූර්ණ ලෙස පෙළගස්වන්නේ කෙසේදැයි සොයා ගන්න.",
        price: "රු. 2500",
        duration: "විනාඩි 45",
        iconName: "Book"
      },
      {
        title: "වාර්ෂික පලාපල",
        description: "රැකියාව, ආදරය, සෞඛ්‍යය සහ ධනය සම්බන්ධයෙන් ඉදිරි වසරේ මාසෙන් මාසයට ඔබට ලැබෙන්නේ කුමක්ද යන්න පිළිබඳව.",
        price: "රු. 4000",
        duration: "විනාඩි 60",
        iconName: "Sparkles"
      }
    ];
    await Service.insertMany(DEFAULT_SERVICES);
    services = await Service.find({ isActive: { $ne: false } }).sort({ createdAt: 1 });
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 sm:mb-6">ජ්‍යෝතිෂ්‍ය සේවාවන්</h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
          සුභද්‍රා ආරත්නායක මහත්මියගේ විශේෂච්ජ මාර්ගෝපදේශය. ඔබේ ජීවන ගමනත් පෙහැදලි බවක් සහ දිශාවක් ලබා ගැනීමත් පෞද්ගලික ඊපදේශනයක් වෙන්කරවා ගන්න.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {services.map((service: any, i: number) => {
          const ServiceIcon = getIcon(service.iconName);
          return (
            <div key={service._id ? service._id.toString() : i} className="bg-space-800/40 border border-space-700 rounded-2xl p-6 md:p-8 hover:bg-space-800 hover:border-gold-500/50 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-space-700 rounded-xl flex items-center justify-center text-gold-400 mb-6 group-hover:scale-110 transition-transform">
                  <ServiceIcon className="w-7 h-7" />
                </div>
                
                <h2 className="text-2xl font-serif font-bold text-white mb-4">{service.title}</h2>
                <p className="text-gray-400 mb-8 min-h-[5rem]">
                  {service.description}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-space-700 mt-auto gap-4">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold text-gold-400">{service.price}</span>
                  <span className="text-sm text-gray-500">{service.duration} සැසිය</span>
                </div>
                <Link 
                  href={`/service-request?serviceId=${service._id ? service._id.toString() : ''}`}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  වෙන්කරවා ගන්න <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking CTA */}
      <div className="bg-gradient-to-r from-space-800 to-space-700 rounded-3xl p-6 sm:p-8 md:p-12 text-center border border-space-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3 sm:mb-4">ඔබට ගැලපෙන සේවාව කුමකදේයි විශ්වාස නැද්ද?</h3>
          <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
            ඔබේ නිශ්කිත අවශ්‍යතා සහ ප්‍රශ්න සඟහා හොඟම ජ්‍යෝතිෂ්‍ය සේවාව තීරණය කිරීමත් කේටි මිනිත්තු 10 ක සාකච්චාවක් සඟහා අප හා සම්බන්ද වන්න.
          </p>
          <Link href="/contact" className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-space-900 font-bold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base">
            අප අමතන්න
          </Link>
        </div>
      </div>
    </div>
  );
}
