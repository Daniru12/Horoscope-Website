import { Lock } from "lucide-react";
import CopyButton from "@/components/CopyButton";

/** Payment is open right after the request is made.
 *  -1 cancelled · 1 payment due · 2 receipt being verified · 3 paid, report being prepared · 4 report unlocked */
export const FINAL_STEP = 4;

export function getStep(req: any) {
  if (req.status === "cancelled") return -1;
  if (req.paymentStatus === "approved") return req.status === "completed" ? 4 : 3;
  if (req.paymentStatus === "uploaded") return 2;
  return 1;
}

export const STEPS = ["ඉල්ලුම", "ගෙවීම", "තහවුරු", "වාර්තාව"];

export const STEP_META: Record<number, { badge: string; cls: string; next: string }> = {
  [-1]: { badge: "අවලංගුයි", cls: "bg-red-500/15 text-red-300 border-red-500/30", next: "මෙම ඉල්ලුම අවලංගු කර ඇත." },
  1: { badge: "ගෙවීම අවශ්‍යයි", cls: "bg-orange-500/15 text-orange-300 border-orange-500/30", next: "ගෙවීම සිදු කර රිසිට්පත උඩුගත කරන්න" },
  2: { badge: "තහවුරු කරමින්", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30", next: "ඔබගේ රිසිට්පත පරීක්ෂා කරමින් පවතී" },
  3: { badge: "වාර්තාව සකස් කරමින්", cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30", next: "ගෙවීම තහවුරුයි — වාර්තාව සකස් කරමින් පවතී" },
  4: { badge: "සම්පූර්ණයි", cls: "bg-green-500/15 text-green-300 border-green-500/30", next: "ඔබගේ වාර්තාව සූදානම් — බලන්න" },
};

export const getFallbackPrice = (serviceName: string, services: any[] = []) => {
  if (services && services.length > 0) {
    const found = services.find((s) => s.title === serviceName);
    if (found && found.price) return found.price;
  }
  if (!serviceName) return "රු. 3000";
  if (serviceName.includes("පොරොන්දම්")) return "රු. 4500";
  if (serviceName.includes("නාමකරණය")) return "රු. 2500";
  if (serviceName.includes("වාර්ෂික")) return "රු. 4000";
  return "රු. 3000";
};

export function StatusBadge({ step }: { step: number }) {
  const s = STEP_META[step];
  return (
    <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border ${s.cls}`}>{s.badge}</span>
  );
}

/** Full labelled stepper */
export function Stepper({ step }: { step: number }) {
  if (step < 0) return null;
  return (
    <ol className="flex items-center w-full" aria-label="Progress">
      {STEPS.map((label, i) => {
        const done = i < step || step === FINAL_STEP;
        const current = i === step && step !== FINAL_STEP;
        return (
          <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                  done
                    ? "bg-gold-500 border-gold-500 text-space-900"
                    : current
                    ? "border-gold-400 text-gold-400 bg-gold-500/10 ring-4 ring-gold-500/10"
                    : "border-space-600 text-gray-500"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={`text-[11px] sm:text-xs ${done || current ? "text-gray-200" : "text-gray-500"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`flex-1 h-px mx-1.5 mb-5 ${done ? "bg-gold-500" : "bg-space-700"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/** Compact progress bar for list cards */
export function MiniProgress({ step }: { step: number }) {
  if (step < 0) return null;
  const filled = step === FINAL_STEP ? STEPS.length : step;
  return (
    <div className="flex gap-1" aria-hidden="true">
      {STEPS.map((_, i) => (
        <span key={i} className={`h-1.5 flex-1 rounded-full ${i < filled ? "bg-gold-500" : i === filled ? "bg-gold-500/40" : "bg-space-700"}`} />
      ))}
    </div>
  );
}

/** Blurred teaser. The text is a placeholder — the real result is never sent to the browser before payment. */
export function BlurredPreview({ hasPdf, imageCount }: { hasPdf: boolean; imageCount: number }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-space-700 bg-space-950/60">
      <div className="p-4 blur-[6px] select-none pointer-events-none" aria-hidden="true">
        <p className="text-gray-300 text-sm leading-relaxed">
          ඔබගේ ජන්ම කේන්දරය අනුව ග්‍රහ පිහිටීම් සහ දශා කාලය පිළිබඳ විස්තරාත්මක පලාපල වාර්තාව මෙහි දිස්වේ.
          ඉදිරි වසර කිහිපය සඳහා රැකියා, මූල්‍ය, පවුල් සහ සෞඛ්‍ය පිළිබඳ මග පෙන්වීම් ද මෙහි ඇතුළත් වේ.
        </p>
        {(hasPdf || imageCount > 0) && (
          <div className="mt-3 flex gap-2">
            {hasPdf && <span className="h-10 w-40 rounded-lg bg-emerald-600/80" />}
            {Array.from({ length: Math.min(imageCount, 3) }).map((_, i) => (
              <span key={i} className="h-10 w-14 rounded-lg bg-space-700" />
            ))}
          </div>
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-space-900/40">
        <span className="flex items-center gap-2 rounded-full bg-space-900/90 border border-gold-500/40 px-4 py-2 text-sm font-medium text-gold-300">
          <Lock className="w-4 h-4" /> ගෙවීමෙන් පසු නැරඹිය හැක
        </span>
      </div>
    </div>
  );
}

export function BankRow({ label, value, copy, highlight }: { label: string; value?: string; copy?: boolean; highlight?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-space-700 last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`font-semibold break-words ${highlight ? "text-gold-400 text-lg tracking-wide" : "text-white text-sm"}`}>{value}</p>
      </div>
      {copy && <CopyButton value={value} label={label} />}
    </div>
  );
}
