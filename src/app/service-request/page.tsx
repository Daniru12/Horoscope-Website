"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MapPin, Phone, Upload, Loader2, CheckCircle2, Camera,
  ArrowLeft, ArrowRight, Sparkles, Trash2, Check, AlertCircle,
} from "lucide-react";
import { BirthDatePicker, BirthTimePicker } from "@/components/BirthPickers";
import toast from "react-hot-toast";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const STEPS = ["සේවාව", "උපන් විස්තර", "සමාලෝචනය"];

const inputBase =
  "w-full min-h-[52px] bg-space-900/50 border rounded-xl py-3 pl-11 pr-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all";
const inputCls = (hasError: boolean) =>
  `${inputBase} ${hasError ? "border-red-500/70 focus:ring-red-500/40" : "border-space-600 focus:ring-gold-500/50"}`;

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-200 mb-2">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-300" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

function ServiceRequestForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const today = new Date().toISOString().split("T")[0];
  const selectedService = services.find((s) => s._id === selectedServiceId);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("පළමුව ඔබගේ ගිණුමට ලොග් වන්න");
      const t = setTimeout(() => router.push("/login"), 1000);
      return () => clearTimeout(t);
    }
    if (status !== "authenticated") return;

    // Pre-fill the number saved on the user's profile from an earlier request
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.phone && setContactNumber((cur) => cur || d.phone))
      .catch(() => {});

    (async () => {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data = await res.json();
          const list: any[] = data.services || [];
          setServices(list);
          const q = searchParams.get("serviceId");
          const found = list.find((s) => s._id === q);
          setSelectedServiceId(found?._id || list[0]?._id || "");
          // Service pre-selected from a service page → skip straight to details
          if (found) setStep(1);
        }
      } catch (err) {
        console.error("Failed to load services", err);
      } finally {
        setServicesLoaded(true);
      }
    })();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Always release the camera when leaving the page
  useEffect(() => () => stopStream(), []);

  function stopStream() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      toast.error("කැමරාව ක්‍රියාත්මක කිරීමට නොහැකි විය. අවසරය පරීක්ෂා කරන්න.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    stopStream();
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setFile(new File([blob], `horoscope_capture_${Date.now()}.jpg`, { type: "image/jpeg" }));
          setErrors((e) => ({ ...e, file: "" }));
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, file: "කරුණාකර ඡායාරූප ගොනුවක් (JPG, PNG) තෝරන්න." }));
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setErrors((er) => ({ ...er, file: "ගොනුව 5MB ට වඩා විශාලයි. කුඩා ගොනුවක් තෝරන්න." }));
      return;
    }
    setErrors((er) => ({ ...er, file: "" }));
    setFile(f);
  };

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0 && !selectedServiceId) e.service = "කරුණාකර සේවාවක් තෝරන්න.";
    if (s === 1) {
      if (!birthDate) e.birthDate = "වසර, මාසය සහ දිනය තෝරන්න.";
      else if (birthDate > today) e.birthDate = "උපන් දිනය අනාගතයක් විය නොහැක.";
      if (!birthTime) e.birthTime = "පැය, මිනිත්තු සහ පෙරවරු/පස්වරු තෝරන්න.";
      if (!birthPlace.trim()) e.birthPlace = "උපන් ස්ථානය ඇතුළත් කරන්න.";
      if (!/^\+?\d{9,13}$/.test(contactNumber.replace(/[\s\-().]/g, ""))) e.contactNumber = "නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න. (උදා: 0771234567)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (validate(step)) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) return goNext();
    if (!validate(0) || !validate(1)) return;

    setLoading(true);
    try {
      let horoscopeImageUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("ඡායාරූපය උඩුගත කිරීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.");
        horoscopeImageUrl = (await up.json()).url;
      }

      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace: birthPlace.trim(),
          contactNumber: contactNumber.trim(),
          note: note.trim(),
          horoscopeImageUrl,
          serviceId: selectedServiceId,
          serviceName: selectedService?.title,
        }),
      });
      if (!res.ok) throw new Error("ඉල්ලුම යොමු කිරීම අසාර්ථක විය. නැවත උත්සාහ කරන්න.");

      setSuccess(true);
      setTimeout(() => router.push("/profile"), 2500);
    } catch (err: any) {
      toast.error(err.message || "දෝෂයකි. නැවත උත්සාහ කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && !servicesLoaded)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-space-800/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 text-center border border-space-700 shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-white mb-3">සාර්ථකයි!</h2>
          <p className="text-gray-300 mb-2">ඔබගේ සේවා ඉල්ලුම සාර්ථකව යොමු කරන ලදී.</p>
          <p className="text-sm text-gray-400 mb-6">දැන්ම ඔබගේ පැතිකඩෙන් ගෙවීම සිදු කර රිසිට්පත උඩුගත කළ හැක.</p>
          <Link href="/profile" className="inline-flex items-center justify-center min-h-[48px] px-6 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-xl transition-colors">
            ගෙවීමට පැතිකඩ වෙත යන්න
          </Link>
        </div>
      </div>
    );
  }

  if (servicesLoaded && services.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-gray-300 text-lg mb-4">දැනට සේවා කිසිවක් නොමැත. පසුව නැවත උත්සාහ කරන්න.</p>
          <Link href="/" className="text-gold-400 hover:text-gold-300">මුල් පිටුවට</Link>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) => (d ? new Date(d + "T00:00:00").toLocaleDateString("si-LK", { year: "numeric", month: "long", day: "numeric" }) : "-");

  return (
    <div className="w-full mx-auto px-4 py-6 md:py-14 max-w-2xl">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2">සේවා ඉල්ලුම් පත්‍රය</h1>
        <p className="text-gray-400 text-sm md:text-base">විනාඩි 2කින් සම්පූර්ණ කරන්න.</p>
      </div>

      {/* Progress */}
      <ol className="flex items-center mb-6 px-1" aria-label="Progress">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border shrink-0 ${
                  done ? "bg-gold-500 border-gold-500 text-space-900" : current ? "border-gold-400 text-gold-400 bg-gold-500/10" : "border-space-600 text-gray-500"
                }`}>
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span className={`text-sm hidden sm:block ${current ? "text-white font-medium" : "text-gray-500"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <span className={`flex-1 h-px mx-3 ${done ? "bg-gold-500" : "bg-space-700"}`} />}
            </li>
          );
        })}
      </ol>
      <p className="sm:hidden text-center text-sm text-gold-400 mb-4">පියවර {step + 1} / 3 — {STEPS[step]}</p>

      <form onSubmit={handleSubmit} noValidate className="bg-space-800/80 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-space-700 shadow-2xl space-y-6">

        {/* STEP 1 — Service */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">ඔබට අවශ්‍ය සේවාව තෝරන්න</h2>
            <div className="space-y-3" role="radiogroup" aria-label="Service">
              {services.map((s) => {
                const active = s._id === selectedServiceId;
                return (
                  <button
                    key={s._id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => { setSelectedServiceId(s._id); setErrors({}); }}
                    className={`w-full text-left flex items-center gap-3 p-4 min-h-[64px] rounded-2xl border transition-all ${
                      active ? "border-gold-500 bg-gold-500/10 ring-1 ring-gold-500/50" : "border-space-600 bg-space-900/40 hover:border-space-500"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${active ? "border-gold-500" : "border-space-500"}`}>
                      {active && <span className="w-2.5 h-2.5 rounded-full bg-gold-500" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-white font-medium break-words">{s.title}</span>
                      {s.description && <span className="block text-xs text-gray-400 line-clamp-2 mt-0.5">{s.description}</span>}
                    </span>
                    {s.price && <span className="text-gold-400 font-bold whitespace-nowrap">{s.price}</span>}
                  </button>
                );
              })}
            </div>
            {errors.service && <p className="mt-2 text-sm text-red-300" role="alert">{errors.service}</p>}
          </div>
        )}

        {/* STEP 2 — Birth details */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">උපන් විස්තර</h2>
            <p className="text-sm text-gray-400 -mt-3">නිවැරදි පලාපල සඳහා හැකි තරම් නිවැරදි තොරතුරු ලබා දෙන්න.</p>

            <Field label="උපන් දිනය" error={errors.birthDate} hint="වසර, මාසය සහ දිනය තෝරන්න.">
              <BirthDatePicker value={birthDate} onChange={setBirthDate} invalid={!!errors.birthDate} />
            </Field>

            <Field label="උපන් වේලාව" error={errors.birthTime} hint="නිශ්චිත වේලාව නොදන්නේ නම් ආසන්න වේලාවක් තෝරන්න.">
              <BirthTimePicker value={birthTime} onChange={setBirthTime} invalid={!!errors.birthTime} />
            </Field>

            <Field label="උපන් ස්ථානය" error={errors.birthPlace}>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gold-400 pointer-events-none" />
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  autoComplete="off"
                  className={inputCls(!!errors.birthPlace)}
                  placeholder="නගරය, රෝහල හෝ ග්‍රාමය"
                />
              </div>
            </Field>

            <Field label="දුරකථන අංකය (WhatsApp)" error={errors.contactNumber} hint="වාර්තාව සූදානම් වූ විට ඔබව සම්බන්ධ කර ගැනීමට.">
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gold-400 pointer-events-none" />
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className={inputCls(!!errors.contactNumber)}
                  placeholder="07X XXX XXXX"
                />
              </div>
            </Field>
          </div>
        )}

        {/* STEP 3 — Document + review */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">කේන්දර සටහන <span className="text-sm font-normal text-gray-400">(අමතර)</span></h2>
              <p className="text-sm text-gray-400 mb-4">ඔබ සතුව කේන්දර සටහනක් ඇත්නම් එහි ඡායාරූපයක් එක් කරන්න.</p>

              {isCameraActive ? (
                <div className="rounded-2xl overflow-hidden border border-space-600 bg-black p-3">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[320px] object-contain rounded-lg mb-3" />
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={capturePhoto} className="min-h-[48px] bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors">
                      ඡායාරූපය ගන්න
                    </button>
                    <button type="button" onClick={stopCamera} className="min-h-[48px] bg-space-700 hover:bg-space-600 text-white font-bold rounded-xl transition-colors">
                      නවතන්න
                    </button>
                  </div>
                </div>
              ) : file ? (
                <div className="flex items-center gap-3 p-3 bg-space-900/50 border border-space-600 rounded-2xl">
                  <img src={previewUrl} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-space-700 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-green-400 font-medium flex items-center gap-1"><Check className="w-4 h-4" /> එක් කරන ලදී</p>
                    <p className="text-xs text-gray-400 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={() => setFile(null)} aria-label="ඉවත් කරන්න" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-red-300 hover:bg-red-500/10">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="cursor-pointer min-h-[96px] flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-space-600 bg-space-900/30 hover:border-gold-500/60 transition-colors text-center">
                    <Upload className="w-7 h-7 text-gold-400" />
                    <span className="text-sm text-gray-200 font-medium">ගොනුවක් තෝරන්න</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <button type="button" onClick={startCamera} className="min-h-[96px] flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-space-600 bg-space-900/30 hover:border-gold-500/60 transition-colors">
                    <Camera className="w-7 h-7 text-gold-400" />
                    <span className="text-sm text-gray-200 font-medium">කැමරාවෙන් ගන්න</span>
                  </button>
                </div>
              )}
              {errors.file ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-red-300" role="alert"><AlertCircle className="w-4 h-4 shrink-0" /> {errors.file}</p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">PNG / JPG • උපරිම 5MB</p>
              )}
            </div>

            {/* Optional note */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-200 mb-2">
                ඔබට කියන්න ඇති දෙයක්? <span className="text-gray-400 font-normal">(අමතර)</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="උදා: විශේෂ ප්‍රශ්නයක්, කැමති වේලාවක්, හෝ වෙනත් තොරතුරු…"
                className="w-full bg-space-900/50 border border-space-600 rounded-xl py-3 px-4 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all resize-none"
              />
              <p className="mt-1 text-right text-xs text-gray-500">{note.length}/500</p>
            </div>

            {/* Review */}
            <div className="rounded-2xl border border-space-700 bg-space-900/40 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-gold-400" /> ඔබගේ ඉල්ලුම</h3>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-gold-400 hover:text-gold-300 min-h-[32px] px-2">සංස්කරණය</button>
              </div>
              <dl className="text-sm divide-y divide-space-700">
                {[
                  ["සේවාව", selectedService?.title],
                  ["මිල", selectedService?.price],
                  ["උපන් දිනය", formatDate(birthDate)],
                  ["උපන් වේලාව", birthTime],
                  ["උපන් ස්ථානය", birthPlace],
                  ["දුරකථන අංකය", contactNumber],
                  ...(note.trim() ? [["සටහන", note.trim()]] : []),
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-4 py-2">
                    <dt className="text-gray-400 shrink-0">{k}</dt>
                    <dd className="text-gray-100 text-right break-words min-w-0">{v || "-"}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-gray-500 mt-3">යොමු කළ පසු ඔබගේ පැතිකඩෙන් වහාම ගෙවීම් කළ හැක.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button type="button" onClick={goBack} disabled={loading} className="min-h-[52px] px-5 flex items-center justify-center gap-2 rounded-xl border border-space-600 text-gray-200 hover:bg-space-700 transition-colors disabled:opacity-50">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">ආපසු</span>
            </button>
          )}
          {step < 2 ? (
            <button type="submit" className="flex-1 min-h-[52px] flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-xl transition-colors">
              ඊළඟට <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={loading} className="flex-1 min-h-[52px] flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-xl transition-colors disabled:opacity-70">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> යොමු කරමින්...</> : "ඉල්ලුම යොමු කරන්න"}
            </button>
          )}
        </div>
      </form>
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
