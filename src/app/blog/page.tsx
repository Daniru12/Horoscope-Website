import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

const POSTS = [
  {
    title: "ඔබේ ලග්නයේ පෞරුෂත්වය කුමක්ද?",
    excerpt: "සෑම ලග්නයකම මූලික ලක්ෂණ, ශක්තීන් සහ දුර්වලතා පිළිබඳව ගැඹුරින් අධ්‍යයනය කරන්න.",
    date: "May 2, 2026",
    author: "සුභද්‍රා ආරත්නායක",
    category: "ජ්‍යෝතිෂ්‍ය මූලධර්ම"
  },
  {
    title: "2026 වර්ෂය සඳහා පලාපල",
    excerpt: "ආදරය, රැකියාව සහ පෞද්ගලික වර්ධනය සම්බන්ධයෙන් මෙම වසරේ තරු ඔබට ගෙන එන්නේ කුමක්දැයි සොයා බලන්න.",
    date: "April 28, 2026",
    author: "සුභද්‍රා ආරත්නායක",
    category: "අනාවැකි"
  },
  {
    title: "ග්‍රහයන් ඔබේ දෛනික ජීවිතයට බලපාන ආකාරය",
    excerpt: "ග්‍රහ ගෝචර සහ බුධ වක්‍ර වීම ඇත්ත වශයෙන්ම ඔබේ සන්නිවේදනයට බලපාන ආකාරය තේරුම් ගැනීම.",
    date: "April 15, 2026",
    author: "සුභද්‍රා ආරත්නායක",
    category: "ග්‍රහ ගමන"
  }
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">ජ්‍යෝතිෂ්‍ය ලිපි</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          ලග්න විස්තර, ග්‍රහ හැසිරීම් සහ ආධ්‍යාත්මික වර්ධනය පිළිබඳ අපගේ නවතම ලිපි කියවන්න.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {POSTS.map((post, i) => (
          <article key={i} className="bg-space-800/60 border border-space-700 rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 flex flex-col group">
            <div className="h-48 bg-space-700 w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-space-800 to-transparent z-10"></div>
              {/* Placeholder for blog image */}
              <div className="w-full h-full bg-space-600 flex items-center justify-center text-space-400 font-serif text-2xl opacity-50 group-hover:scale-105 transition-transform duration-500">
                ✨
              </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <span className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-3">
                {post.category}
              </span>
              <h2 className="text-xl font-serif font-bold text-white mb-3 hover:text-gold-300 transition-colors cursor-pointer">
                {post.title}
              </h2>
              <p className="text-gray-400 text-sm mb-6 flex-grow">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-space-700/50 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {post.date}
                </div>
                <button className="text-gold-400 font-medium flex items-center gap-1 hover:text-gold-300 transition-colors">
                  කියවන්න <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
