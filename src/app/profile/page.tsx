import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { User, Plus, Inbox, ChevronRight, Calendar, Wallet, Clock, CheckCircle2, Hourglass, FileText } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import Service from "@/models/Service";
import { FINAL_STEP, getStep, getFallbackPrice, StatusBadge, MiniProgress, STEP_META } from "@/components/profile/shared";

const NEXT_ICON: Record<number, typeof Wallet> = { 1: Wallet, 2: Hourglass, 3: Clock, 4: FileText };

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  if ((session as any).user.role === "admin") {
    redirect("/admin");
  }

  await connectToDatabase();
  const requests = await ServiceRequest.find({ user: session.user.id }).populate("service").sort({ createdAt: -1 });
  const allServices = await Service.find({ isActive: { $ne: false } });

  const items = requests.map((r) => ({ r, step: getStep(r) }));
  const needsPayment = items.filter((i) => i.step === 1).length;
  const inProgress = items.filter((i) => i.step === 2 || i.step === 3).length;
  const done = items.filter((i) => i.step === FINAL_STEP).length;

  // Things that need the customer's attention first, then the rest (newest first within each group)
  const attention = items.filter((i) => i.step === 1 || i.step === FINAL_STEP);
  const others = items.filter((i) => !(i.step === 1 || i.step === FINAL_STEP));

  const Card = ({ r, step }: { r: any; step: number }) => {
    const Icon = NEXT_ICON[step] || CheckCircle2;
    const price = (r.service as any)?.price || getFallbackPrice(r.serviceName, allServices);
    const urgent = step === 1;
    return (
      <Link
        href={`/profile/requests/${r._id.toString()}`}
        className={`group block rounded-2xl border p-4 sm:p-5 transition-colors ${
          urgent ? "border-orange-500/40 bg-orange-500/[0.06] hover:border-orange-400/70" : "border-space-700 bg-space-800/60 hover:border-gold-500/40"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-base sm:text-lg font-medium text-white break-words">{r.serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම"}</h4>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" /> {new Date(r.createdAt).toLocaleDateString("si-LK")} · {price}
            </p>
          </div>
          <StatusBadge step={step} />
        </div>

        <div className="mt-4">
          <MiniProgress step={step} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className={`grid place-items-center w-9 h-9 rounded-xl shrink-0 ${urgent ? "bg-orange-500/15 text-orange-300" : "bg-space-900/70 text-gold-400"}`}>
            <Icon className="w-[18px] h-[18px]" />
          </span>
          <p className={`flex-1 min-w-0 text-sm ${urgent ? "text-orange-100 font-medium" : "text-gray-300"}`}>{STEP_META[step]?.next}</p>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gold-400 shrink-0 transition-colors" />
        </div>
      </Link>
    );
  };

  return (
    <div className="w-full mx-auto px-4 py-8 md:py-16 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 md:items-start">

        {/* ── Profile card ── */}
        <aside className="w-full md:w-1/3 md:sticky md:top-24">
          <div className="bg-space-800/80 backdrop-blur-md rounded-3xl p-5 md:p-8 border border-space-700 shadow-2xl">
            <div className="flex md:flex-col items-center gap-4 md:gap-0 md:text-center">
              <div className="w-16 h-16 md:w-28 md:h-28 md:mb-5 shrink-0 rounded-full border-2 md:border-4 border-gold-500/50 overflow-hidden bg-space-900 flex items-center justify-center">
                {session.user.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <User className="w-8 h-8 md:w-14 md:h-14 text-gold-400" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-2xl font-serif font-bold text-white truncate">{session.user.name}</h2>
                <p className="text-gray-400 text-sm truncate md:mb-1">{session.user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5 text-center">
              {[
                { n: needsPayment, l: "ගෙවීම්", c: needsPayment ? "text-orange-300" : "text-gold-400" },
                { n: inProgress, l: "සකස් වෙමින්", c: "text-gold-400" },
                { n: done, l: "සම්පූර්ණ", c: "text-gold-400" },
              ].map((s) => (
                <div key={s.l} className="bg-space-900/60 border border-space-700 rounded-xl py-2.5 px-1">
                  <p className={`text-xl font-bold ${s.c}`}>{s.n}</p>
                  <p className="text-[11px] text-gray-400 leading-tight">{s.l}</p>
                </div>
              ))}
            </div>

            <Link
              href="/service-request"
              className="mt-5 flex items-center justify-center gap-2 w-full min-h-[48px] bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" /> නව සේවා ඉල්ලුමක්
            </Link>
          </div>
        </aside>

        {/* ── Requests ── */}
        <section className="w-full md:w-2/3 min-w-0">
          <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-4 px-1">ඔබගේ සේවා ඉල්ලුම්</h3>

          {requests.length === 0 ? (
            <div className="bg-space-800/60 rounded-3xl border border-dashed border-space-600 text-center py-14 px-6">
              <Inbox className="w-14 h-14 text-space-600 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-4">ඔබට දැනට කිසිදු සේවා ඉල්ලුමක් නොමැත.</p>
              <Link
                href="/service-request"
                className="inline-flex items-center justify-center min-h-[48px] px-6 bg-gold-500 hover:bg-gold-400 text-space-900 font-bold rounded-xl transition-colors"
              >
                පළමු ඉල්ලුම යොමු කරන්න
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {attention.length > 0 && (
                <div>
                  <p className="text-xs font-semibold tracking-wide text-gray-400 mb-2 px-1">ඔබගේ අවධානය අවශ්‍යයි ({attention.length})</p>
                  <div className="space-y-3">
                    {attention.map(({ r, step }) => (
                      <Card key={r._id.toString()} r={r} step={step} />
                    ))}
                  </div>
                </div>
              )}
              {others.length > 0 && (
                <div>
                  {attention.length > 0 && <p className="text-xs font-semibold tracking-wide text-gray-400 mb-2 px-1">වෙනත් ඉල්ලුම් ({others.length})</p>}
                  <div className="space-y-3">
                    {others.map(({ r, step }) => (
                      <Card key={r._id.toString()} r={r} step={step} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
