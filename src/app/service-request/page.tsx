"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Calendar, MapPin, Clock, Upload, Loader2, CheckCircle2, X } from "lucide-react";
import { TimePicker } from "@poursha98/react-ios-time-picker";
import "@poursha98/react-ios-time-picker/styles.css";

import toast from "react-hot-toast";

function ServiceRequestForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [birthPlace, setBirthPlace] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedServiceName, setSelectedServiceName] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Camera states and refs
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("පළමුව ඔබගේ ගිණුමට ලොග් වන්න (First login to your account)");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }

    async function loadServices() {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data = await res.json();
          setServices(data.services);
          
          const queryServiceId = searchParams.get("serviceId");
          if (queryServiceId && data.services.some((s: any) => s._id === queryServiceId)) {
            const found = data.services.find((s: any) => s._id === queryServiceId);
            setSelectedServiceId(found._id);
            setSelectedServiceName(found.title);
          } else if (data.services.length > 0) {
            setSelectedServiceId(data.services[0]._id);
            setSelectedServiceName(data.services[0].title);
          }
        }
      } catch (err) {
        console.error("Failed to load services", err);
      }
    }
    loadServices();

    return () => {
      // Clean up camera stream if unmounted
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [status]);

  if (status === "loading" || (status === "authenticated" && services.length === 0)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("කැමරාව ක්‍රියාත්මක කිරීමට නොහැකි විය. කරුණාකර අවසර පරීක්ෂා කරන්න. (Could not activate camera. Please check permissions.)");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `horoscope_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
            setFile(capturedFile);
            stopCamera();
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
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
          serviceId: selectedServiceId,
          serviceName: selectedServiceName,
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
      <div className="bg-space-800/80 backdrop-blur-md rounded-3xl p-6 md:p-12 border border-space-700 shadow-2xl relative overflow-hidden">
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">අවශ්‍ය සේවාව (Requested Service)</label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  const sId = e.target.value;
                  setSelectedServiceId(sId);
                  const sObj = services.find(s => s._id === sId);
                  if (sObj) setSelectedServiceName(sObj.title);
                }}
                className="w-full bg-space-900/50 border border-space-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
                required
              >
                {services.map((s) => (
                  <option key={s._id} value={s._id} className="bg-space-900 text-white">
                    {s.title} - {s.price}
                  </option>
                ))}
              </select>
            </div>

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
                    className="w-full bg-space-900/50 border border-space-600 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all [color-scheme:dark] cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:inset-0"
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
                    type="text"
                    readOnly
                    value={birthTime}
                    placeholder="වේලාව තෝරන්න (Select Time)"
                    onClick={() => setShowTimePicker(true)}
                    className="w-full bg-space-900/50 border border-space-600 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all cursor-pointer"
                    required
                  />

                  {showTimePicker && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                      <div className="bg-space-800 border border-space-600 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl">
                        <button
                          type="button"
                          onClick={() => setShowTimePicker(false)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-xl font-serif text-white mb-6 text-center">උපන් වේලාව (Birth Time)</h3>
                        
                        <div className="bg-space-900/50 rounded-2xl p-4 [color-scheme:dark] flex justify-center items-center">
                          <TimePicker
                            value={birthTime || "12:00 PM"}
                            onChange={setBirthTime}
                            is12Hour={true}
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (!birthTime) setBirthTime("12:00 PM");
                            setShowTimePicker(false);
                          }}
                          className="mt-6 w-full py-3 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-xl transition-colors"
                        >
                          තහවුරු කරන්න (Confirm)
                        </button>
                      </div>
                    </div>
                  )}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">කේන්දර සටහන (Horoscope Document)</label>
              
              {isCameraActive ? (
                <div className="relative rounded-xl overflow-hidden border border-space-600 bg-black flex flex-col items-center p-4">
                  <video ref={videoRef} autoPlay playsInline className="w-full max-h-[300px] object-contain rounded-lg mb-4" />
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      ඡායාරූපය ගන්න (Capture)
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-6 py-2.5 bg-red-650 hover:bg-red-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      නවතන්න (Cancel)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-space-600 border-dashed rounded-xl bg-space-900/30 hover:bg-space-900/50 transition-colors">
                  <div className="space-y-1 text-center w-full">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-400 justify-center mt-4 px-2">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-space-850 hover:bg-space-700 rounded-md font-medium text-gold-400 hover:text-gold-300 focus-within:outline-none px-4 py-2.5 border border-space-700 transition-colors text-center flex-grow sm:flex-grow-0">
                        <span>ගොනුවක් තෝරන්න (Select File)</span>
                        <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="cursor-pointer bg-space-850 hover:bg-space-700 rounded-md font-medium text-gold-400 hover:text-gold-300 px-4 py-2.5 border border-space-700 transition-colors text-center flex-grow sm:flex-grow-0"
                      >
                        කැමරාව ක්‍රියාත්මක කරන්න (Use Camera)
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                    
                    {file && (
                      <div className="mt-4 p-3 bg-space-950/60 border border-space-800 rounded-lg inline-flex flex-col items-center gap-2">
                        <span className="text-sm text-green-400 font-medium">තෝරාගත් ඡායාරූපය: {file.name}</span>
                        <img src={URL.createObjectURL(file)} alt="Preview" className="h-28 w-auto rounded border border-space-800 object-contain shadow-md" />
                      </div>
                    )}
                  </div>
                </div>
              )}
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

export default function ServiceRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-gold-500" /></div>}>
      <ServiceRequestForm />
    </Suspense>
  );
}
