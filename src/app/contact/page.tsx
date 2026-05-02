import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">අප හා සම්බන්ධ වන්න</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          තරු ඔබ වෙනුවෙන් ගෙන එන්නේ කුමක්දැයි සොයා බැලීමට සූදානම්ද? වේලාවක් වෙන්කරවා ගැනීමට හෝ කිසියම් ප්‍රශ්නයක් ඇසීමට අප හා සම්බන්ධ වන්න.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Contact Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-space-800/50 border border-space-700 p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-space-700 p-3 rounded-full text-gold-400">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">දුරකථනය</h3>
              <p className="text-gray-400 mb-2">+1 (555) 123-4567</p>
              <p className="text-xs text-gray-500">සඳුදා සිට සිකුරාදා දක්වා පෙ.ව. 9 සිට ප.ව. 6 දක්වා.</p>
            </div>
          </div>
          
          <div className="bg-space-800/50 border border-space-700 p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-space-700 p-3 rounded-full text-green-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">වට්ස්ඇප්</h3>
              <p className="text-gray-400 mb-3">+1 (555) 987-6543</p>
              <a href="#" className="inline-block px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors">
                වට්ස්ඇප් හරහා සම්බන්ධ වන්න
              </a>
            </div>
          </div>

          <div className="bg-space-800/50 border border-space-700 p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-space-700 p-3 rounded-full text-gold-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">විද්‍යුත් තැපෑල</h3>
              <p className="text-gray-400">info@subadra-astrology.com</p>
            </div>
          </div>

          <div className="bg-space-800/50 border border-space-700 p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-space-700 p-3 rounded-full text-gold-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">ස්ථානය</h3>
              <p className="text-gray-400">123 Starry Lane<br/>Universe City, UC 90210</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="w-full lg:w-2/3">
          <div className="bg-space-800/80 border border-space-700 p-8 md:p-10 rounded-3xl">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">පණිවිඩයක් යවන්න</h2>
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-300">සම්පූර්ණ නම</label>
                  <input type="text" id="name" className="bg-space-900 border border-space-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="John Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">විද්‍යුත් තැපැල් ලිපිනය</label>
                  <input type="email" id="email" className="bg-space-900 border border-space-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="john@example.com" />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="service" className="text-sm font-medium text-gray-300">උනන්දුවක් දක්වන සේවාව (විකල්ප)</label>
                <select id="service" className="bg-space-900 border border-space-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none">
                  <option value="">සේවාවක් තෝරන්න...</option>
                  <option value="personal">පෞද්ගලික කේන්දර පරීක්ෂාව</option>
                  <option value="marriage">පොරොන්දම් ගැලපීම</option>
                  <option value="numerology">නාමකරණය සහ අංක විද්‍යාව</option>
                  <option value="other">වෙනත් විමසීමක්</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-300">ඔබගේ පණිවිඩය</label>
                <textarea id="message" rows={5} className="bg-space-900 border border-space-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors resize-none" placeholder="අපට ඔබට උදව් කළ හැක්කේ කෙසේද?"></textarea>
              </div>

              <button type="button" className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-lg transition-colors mt-2 text-lg">
                පණිවිඩය යවන්න
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
