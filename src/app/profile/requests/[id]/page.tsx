import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import {
  ArrowLeft, Calendar, Clock, MapPin, Phone, FileText, Download, Wallet, Hourglass, CheckCircle2, Info, Image as ImageIcon,
} from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import Service from "@/models/Service";
import Setting from "@/models/Setting";
import ImageLightbox from "@/components/ImageLightbox";
import PaymentUpload from "@/components/PaymentUpload";
import {
  FINAL_STEP, getStep, getFallbackPrice, StatusBadge, Stepper, BlurredPreview, BankRow,
} from "@/components/profile/shared";

const card = "bg-space-800/60 rounded-2xl md:rounded-3xl border border-space-700 p-5 sm:p-6";

function SectionTitle({ icon: Icon, children }: { icon: typeof Info; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-serif font-bold text-white mb-4">
      <Icon className="w-5 h-5 text-gold-400" /> {children}
    </h2>
  );
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session as any).user.role === "admin") redirect("/admin");

  await connectToDatabase();
  let req: any = null;
  try {
    req = await ServiceRequest.findOne({ _id: id, user: session.user.id }).populate("service");
  } catch {
    req = null; // malformed id
  }
  if (!req) notFound();

  const allServices = await Service.find({ isActive: { $ne: false } });
  const settings: any = (await Setting.findOne()) || {};
  const step = getStep(req);
  const price = (req.service as any)?.price || getFallbackPrice(req.serviceName, allServices);
  const reportReady = req.status === "completed";

  return (
    <div className="w-full mx-auto px-4 py-6 md:py-12 max-w-3xl">
      <Link href="/profile" className="inline-flex items-center gap-2 min-h-[44px] text-sm text-gray-400 hover:text-gold-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> ඔබගේ ඉල්ලුම් වෙත
      </Link>

      {/* ── Header + progress ── */}
      <div className={`${card} mt-2`}>
        <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white break-words">{req.serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම"}</h1>
            <p className="text-sm text-gray-500 mt-1">
              ඉල්ලුම් කළ දිනය: {new Date(req.createdAt).toLocaleDateString("si-LK")} · {price}
            </p>
          </div>
          <div className="self-start"><StatusBadge step={step} /></div>
        </div>
        {step >= 0 && <div className="mt-6 px-1"><Stepper step={step} /></div>}
      </div>

      <div className="space-y-5 mt-5">
        {step === -1 && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">මෙම ඉල්ලුම අවලංගු කර ඇත.</div>
        )}

        {/* ── 1. Payment ── */}
        {step === 1 && (
          <section className={`${card} !border-orange-500/40`}>
            <SectionTitle icon={Wallet}>පියවර 1 — ගෙවීම</SectionTitle>
            <p className="text-sm text-gray-300 mb-4">
              {reportReady
                ? "ඔබගේ වාර්තාව සූදානම්. පහත ගිණුමට මුදල් බැර කර රිසිට්පත උඩුගත කළ විට එය අගුළු හැරේ."
                : "ගෙවීම දැන්ම කළ හැක. මුදල් බැර කර රිසිට්පත උඩුගත කරන්න — වාර්තාව සූදානම් වූ විට ඔබට ලැබේ."}
            </p>

            <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 mb-4">
              <span className="text-sm text-emerald-200">ගෙවිය යුතු මුදල</span>
              <span className="text-xl font-bold text-emerald-400">{price}</span>
            </div>

            <div className="bg-space-900/60 rounded-xl border border-space-700 px-3 mb-5">
              <BankRow label="බැංකුව (Bank)" value={settings.bankName} />
              <BankRow label="ශාඛාව (Branch)" value={settings.branchName} copy />
              <BankRow label="ගිණුම් නාමය (Account Name)" value={settings.accountName} copy />
              <BankRow label="ගිණුම් අංකය (Account Number)" value={settings.accountNumber} copy highlight />
              <BankRow label="දුරකථන අංකය (Mobile)" value={settings.mobileNumber} copy />
            </div>

            <p className="text-sm font-medium text-white mb-2">රිසිට්පත උඩුගත කරන්න</p>
            <PaymentUpload requestId={req._id.toString()} />
          </section>
        )}

        {step === 2 && (
          <section className={`${card} !border-blue-500/30`}>
            <SectionTitle icon={Hourglass}>ගෙවීම තහවුරු කරමින්</SectionTitle>
            <p className="text-sm text-blue-200">ඔබගේ රිසිට්පත ලැබුණා. පරිපාලක පරීක්ෂා කර තහවුරු කරන තෙක් රැඳී සිටින්න.</p>
            {req.paymentReceiptUrl && (
              <a href={req.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 min-h-[44px] text-sm text-gold-400 hover:text-gold-300">
                <ImageIcon className="w-4 h-4" /> ඔබ යැවූ රිසිට්පත බලන්න
              </a>
            )}
          </section>
        )}

        {/* ── 2. Report ── */}
        {step >= 1 && (
          <section className={card}>
            <SectionTitle icon={FileText}>පලාපල වාර්තාව</SectionTitle>

            {step === FINAL_STEP && (
              <div>
                <p className="text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                  {req.resultText || "පලාපල වාර්තාවක් නොමැත."}
                </p>
                {req.resultPdfUrl && (
                  <a
                    href={req.resultPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex sm:inline-flex items-center justify-center gap-2 min-h-[48px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 rounded-xl transition-colors"
                  >
                    <Download className="w-5 h-5" /> PDF වාර්තාව බාගත කරන්න
                  </a>
                )}
                {req.resultImageUrls?.length > 0 && <ImageLightbox images={req.resultImageUrls} />}
              </div>
            )}

            {step === 3 && (
              <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>ඔබගේ ගෙවීම තහවුරු කර ඇත. වාර්තාව සකස් වූ වහාම මෙහි දිස්වේ.</p>
              </div>
            )}

            {(step === 1 || step === 2) &&
              (reportReady ? (
                <BlurredPreview hasPdf={!!req.resultPdfUrl} imageCount={req.resultImageUrls?.length || 0} />
              ) : (
                <p className="text-sm text-gray-400">වාර්තාව තවමත් සකස් කරමින් පවතී. එය සූදානම් වූ විට ගෙවීම තහවුරු කර ඇත්නම් මෙහි පෙන්වයි.</p>
              ))}
          </section>
        )}

        {/* ── 3. Request details ── */}
        <section className={card}>
          <SectionTitle icon={Info}>ඔබ ලබා දුන් තොරතුරු</SectionTitle>
          <dl className="divide-y divide-space-700 text-sm">
            {[
              { Icon: Calendar, k: "උපන් දිනය", v: req.birthDate },
              { Icon: Clock, k: "උපන් වේලාව", v: req.birthTime },
              { Icon: MapPin, k: "උපන් ස්ථානය", v: req.birthPlace },
              { Icon: Phone, k: "දුරකථන අංකය", v: req.contactNumber },
            ].map(({ Icon, k, v }) => (
              <div key={k} className="flex items-center gap-3 py-3">
                <Icon className="w-4 h-4 text-gold-400 shrink-0" />
                <dt className="text-gray-400 w-28 shrink-0">{k}</dt>
                <dd className="text-gray-100 min-w-0 break-words">{v || "-"}</dd>
              </div>
            ))}
          </dl>
          {req.note && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-1">ඔබගේ සටහන</p>
              <p className="text-sm text-gray-100 whitespace-pre-wrap break-words bg-space-900/50 rounded-xl p-3">{req.note}</p>
            </div>
          )}
          {req.horoscopeImageUrl && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">උඩුගත කළ කේන්දර සටහන</p>
              <a href={req.horoscopeImageUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                <img src={req.horoscopeImageUrl} alt="කේන්දර සටහන" className="h-28 w-auto max-w-full rounded-lg border border-space-700 hover:border-gold-500 transition-colors" loading="lazy" />
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
