"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";

/* ── Surfaces (flat, app-like) ────────────────────────────────────────── */
export const card = "bg-[#0d1426] border border-white/[0.07] rounded-2xl";
export const cardHover = "transition-colors hover:bg-[#111a31] hover:border-white/[0.12]";
export const inputCls =
  "w-full h-12 bg-[#0a1020] border border-white/10 rounded-xl px-4 text-[15px] text-white placeholder:text-gray-500 focus:outline-none focus:border-gold-400/70 focus:ring-4 focus:ring-gold-500/10 transition";
export const textareaCls =
  "w-full bg-[#0a1020] border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white placeholder:text-gray-500 focus:outline-none focus:border-gold-400/70 focus:ring-4 focus:ring-gold-500/10 transition";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-semibold bg-gold-400 text-[#1a1304] hover:bg-gold-300 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-medium bg-white/[0.06] text-gray-100 hover:bg-white/10 active:scale-[0.98] transition disabled:opacity-40 disabled:pointer-events-none";
export const btnGreen =
  "inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-semibold bg-emerald-500 text-[#04140c] hover:bg-emerald-400 active:scale-[0.98] transition disabled:opacity-50";

/* ── Record stage ─────────────────────────────────────────────────────────
   Every request is in exactly one stage, derived from status + paymentStatus,
   so the admin always sees "what happens next" for a record. */
export type Stage = "new" | "awaiting_payment" | "verify_payment" | "in_progress" | "completed" | "cancelled";

/* Real customer flow: request → admin sends result → customer pays → admin verifies receipt.
   A receipt upload always wins, even after the result was sent. */
export function stageOf(r: any): Stage {
  if (r.status === "cancelled") return "cancelled";
  if (r.paymentStatus === "uploaded") return "verify_payment";
  if (r.status === "completed") return r.paymentStatus === "approved" ? "completed" : "awaiting_payment";
  if (r.paymentStatus === "approved") return "in_progress";
  return "new";
}

export const STAGE_META: Record<Stage, { label: string; short: string; hint: string; cls: string; dot: string }> = {
  new: {
    label: "අලුත් ඉල්ලීම",
    short: "අලුත්",
    hint: "අලුත් ඉල්ලීමක් — උපත් විස්තර පරීක්ෂා කර පලාපල වාර්තාව යවන්න.",
    cls: "bg-violet-400/15 text-violet-200",
    dot: "bg-violet-400",
  },
  awaiting_payment: {
    label: "ගෙවීම බලාපොරොත්තුවෙන්",
    short: "ගෙවීම නැත",
    hint: "වාර්තාව යවා ඇත. පාරිභෝගිකයා රිසිට්පත යවන තෙක් රැඳී සිටින්න.",
    cls: "bg-slate-400/10 text-slate-300",
    dot: "bg-slate-400",
  },
  verify_payment: {
    label: "ගෙවීම තහවුරු කරන්න",
    short: "තහවුරු කරන්න",
    hint: "රිසිට්පත ලැබී ඇත — පරීක්ෂා කර අනුමත කරන්න.",
    cls: "bg-sky-400/15 text-sky-200",
    dot: "bg-sky-400",
  },
  in_progress: {
    label: "ප්‍රතිඵල යැවිය යුතුයි",
    short: "ප්‍රතිඵල යවන්න",
    hint: "ගෙවීම අනුමතයි — පලාපල වාර්තාව යවන්න.",
    cls: "bg-gold-400/15 text-gold-200",
    dot: "bg-gold-400",
  },
  completed: {
    label: "සම්පූර්ණයි",
    short: "සම්පූර්ණයි",
    hint: "",
    cls: "bg-emerald-400/12 text-emerald-300",
    dot: "bg-emerald-400",
  },
  cancelled: { label: "අවලංගුයි", short: "අවලංගුයි", hint: "", cls: "bg-red-400/12 text-red-300", dot: "bg-red-400" },
};

export const STAGE_ORDER: Stage[] = ["verify_payment", "new", "in_progress", "awaiting_payment", "completed", "cancelled"];

export function StageBadge({ stage, short = false }: { stage: Stage; short?: boolean }) {
  const m = STAGE_META[stage];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium whitespace-nowrap ${m.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} aria-hidden="true" />
      {short ? m.short : m.label}
    </span>
  );
}

/* ── People ───────────────────────────────────────────────────────────── */
const AVATAR_TINTS = [
  "bg-gold-400/15 text-gold-200",
  "bg-sky-400/15 text-sky-200",
  "bg-emerald-400/15 text-emerald-200",
  "bg-violet-400/15 text-violet-200",
  "bg-rose-400/15 text-rose-200",
];

export function Avatar({ name, image, size = 40 }: { name?: string; image?: string; size?: number }) {
  const n = name || "?";
  if (image) {
    return <img src={image} alt="" width={size} height={size} className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  let h = 0;
  for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
  return (
    <span
      className={`grid place-items-center rounded-full font-semibold shrink-0 ${AVATAR_TINTS[h % AVATAR_TINTS.length]}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {n.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/* ── Money ────────────────────────────────────────────────────────────── */
export function parsePrice(priceStr?: string): number {
  if (!priceStr) return 0;
  const m = String(priceStr).replace(/,/g, "").match(/\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

export function priceOf(req: any, services: any[] = []): string {
  if (req.service?.price) return req.service.price;
  const found = services.find((s) => s.title === req.serviceName);
  if (found?.price) return found.price;
  const n = req.serviceName || "";
  if (n.includes("පොරොන්දම්")) return "රු. 4500";
  if (n.includes("නාමකරණය")) return "රු. 2500";
  if (n.includes("වාර්ෂික")) return "රු. 4000";
  return "රු. 3000";
}

export const rupees = (n: number) => `රු. ${n.toLocaleString("en-US")}`;

/* ── Dates ────────────────────────────────────────────────────────────── */
const pad = (n: number) => String(n).padStart(2, "0");
const SI_DAYS = ["ඉරිදා", "සඳුදා", "අඟහරුවාදා", "බදාදා", "බ්‍රහස්පතින්දා", "සිකුරාදා", "සෙනසුරාදා"];
export const SI_MONTHS = ["ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි", "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"];

export function sinhalaDate(d = new Date()) {
  return `${SI_DAYS[d.getDay()]}, ${SI_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function fmtDate(value?: string | Date, withTime = false) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

export function timeAgo(value?: string | Date) {
  if (!value) return "";
  const s = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (s < 60) return "දැන්";
  if (s < 3600) return `මිනිත්තු ${Math.floor(s / 60)}කට පෙර`;
  if (s < 86400) return `පැය ${Math.floor(s / 3600)}කට පෙර`;
  if (s < 86400 * 30) return `දින ${Math.floor(s / 86400)}කට පෙර`;
  return fmtDate(value);
}

/* ── CSV export (BOM so Excel shows Sinhala correctly) ────────────────── */
export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = "﻿" + rows.map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Controls ─────────────────────────────────────────────────────────── */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-white/15"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function useIsDesktop(query = "(min-width: 1024px)") {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/* ── Overlays ─────────────────────────────────────────────────────────── */
function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

/** Record panel: a full-height bottom sheet on phones, a right-hand panel on desktop.
    The footer is pinned so the main action is always within thumb reach. */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  full = false,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** On desktop, fill the whole screen (content centered, max-w-5xl) instead of a 560px side panel. */
  full?: boolean;
}) {
  useOverlay(open, onClose);
  const desktop = useIsDesktop();
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={
              desktop
                ? full
                  ? "absolute inset-0 bg-[#0a0f1e] flex flex-col"
                  : "absolute right-0 top-0 h-full w-[560px] bg-[#0a0f1e] border-l border-white/[0.08] flex flex-col shadow-2xl"
                : "absolute inset-x-0 bottom-0 top-3 bg-[#0a0f1e] rounded-t-[28px] border-t border-white/[0.08] flex flex-col shadow-2xl"
            }
            initial={desktop ? { x: "100%" } : { y: "100%" }}
            animate={desktop ? { x: 0 } : { y: 0 }}
            exit={desktop ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "tween", duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {!desktop && <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-white/20" aria-hidden="true" />}
            <header className="border-b border-white/[0.06]">
              <div className={`flex items-start gap-3 px-5 pt-4 pb-4 ${full ? "mx-auto w-full max-w-5xl lg:px-8" : ""}`}>
                <div className="min-w-0 flex-1">{title}{subtitle}</div>
                <button onClick={onClose} aria-label="වසන්න" className="grid place-items-center w-10 h-10 -mr-2 rounded-full text-gray-300 hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className={`px-5 py-5 ${full ? "mx-auto w-full max-w-5xl lg:px-8 lg:py-8" : ""}`}>{children}</div>
            </div>
            {footer && (
              <footer className="border-t border-white/[0.06] bg-[#0a0f1e] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className={`px-5 pt-3 ${full ? "mx-auto w-full max-w-5xl lg:px-8 lg:flex lg:justify-end [&>*]:lg:!w-auto [&>*]:lg:min-w-[320px]" : ""}`}>{footer}</div>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Centered dialog on desktop, bottom sheet on phones. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  useOverlay(open, onClose);
  const desktop = useIsDesktop("(min-width: 640px)");
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto overscroll-contain bg-[#0a0f1e] border border-white/[0.08] rounded-t-[28px] sm:rounded-3xl px-5 sm:px-7 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
            initial={desktop ? { opacity: 0, scale: 0.96 } : { y: "100%" }}
            animate={desktop ? { opacity: 1, scale: 1 } : { y: 0 }}
            exit={desktop ? { opacity: 0, scale: 0.96 } : { y: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button onClick={onClose} aria-label="වසන්න" className="grid place-items-center w-10 h-10 -mr-2 rounded-full text-gray-300 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy,
  tone = "gold",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  tone?: "gold" | "green";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="text-gray-300 leading-relaxed mb-6">{message}</div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={onCancel} className={btnSecondary}>
          අවලංගු කරන්න
        </button>
        <button onClick={onConfirm} disabled={busy} className={tone === "green" ? btnGreen : btnPrimary}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function EmptyState({ icon, title, hint, action }: { icon: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl grid place-items-center bg-white/[0.05] text-gold-300 mb-4">{icon}</div>
      <p className="text-white font-semibold">{title}</p>
      {hint && <p className="text-sm text-gray-400 mt-1 max-w-xs">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
