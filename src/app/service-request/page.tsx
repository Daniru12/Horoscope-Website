"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar, MapPin, Clock, Upload, Loader2, CheckCircle2 } from "lucide-react";

export default function ServiceRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let horoscopeImageUrl = "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        
        const uploadData = await uploadRes.json();
        horoscopeImageUrl = uploadData.url;
      }

      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace,
          horoscopeImageUrl,
        }),
      });

      if (!res.ok) throw new Error("Service request failed");

      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "දෝෂයකි (Something went wrong)");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-space-800/80 backdrop-blur-md rounded-3xl p-12 text-center border border-space-700 shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-white mb-4">සාර්ථකයි!</h2>
          <p className="text-gray-300 mb-8">ඔබගේ සේවා ඉල්ලුම සාර්ථකව යොමු කරන ලදී. (Your request has been submitted successfully)</p>
          <p className="text-sm text-gray-400">ඔබව පැතිකඩ (Profile) වෙත යොමු කරමින් පවතී...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="bg-space-800/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-space-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">සේවා ඉල්ලුම් පත්‍රය</h1>
            <p className="text-gray-400">ඔබගේ ජ්‍යෝතිෂ්‍ය කියවීම සඳහා පහත තොරතුරු ලබා දෙන්න.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">උපන් දිනය</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gold-400" />
                  </div>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-space-900/50 border border-space-600 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">උපන් වේලාව</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gold-400" />
                  </div>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-space-900/50 border border-space-600 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">උපන් ස්ථානය</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gold-400" />
                </div>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  className="w-full bg-space-900/50 border border-space-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
                  placeholder="නගරය, රෝහල හෝ ග්‍රාමය"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">කේන්දර සටහනේ ඡායාරූපයක් (විකල්ප)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-space-600 border-dashed rounded-xl bg-space-900/30 hover:bg-space-900/50 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-400 justify-center mt-4">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-space-800 rounded-md font-medium text-gold-400 hover:text-gold-300 focus-within:outline-none px-3 py-1">
                      <span>ඡායාරූපය තෝරන්න</span>
                      <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                  {file && <p className="text-sm text-green-400 mt-2">තෝරාගත් ගොනුව: {file.name}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-400 text-space-900 font-bold py-4 rounded-xl transition-colors mt-8 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> කරුණාකර රැඳී සිටින්න...
                </>
              ) : "ඉල්ලුම යොමු කරන්න"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
