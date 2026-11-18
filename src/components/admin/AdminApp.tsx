"use client";

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Home, FileText, Wallet, Sparkles, Users, Settings, MoreHorizontal, Search, RefreshCw, Download, ChevronRight,
  CheckCircle2, Inbox, X, Plus, Pencil, Star, Heart, Book, LogOut, Globe, ArrowRight, Loader2, ArrowUpDown,
} from "lucide-react";
import AdminSettings from "@/components/AdminSettings";
import RequestDrawer from "./RequestDrawer";
import {
  type Stage, STAGE_META, STAGE_ORDER, StageBadge, stageOf, priceOf, parsePrice, rupees, fmtDate, timeAgo, sinhalaDate,
  downloadCSV, EmptyState, Modal, Avatar, Switch, card, cardHover, inputCls, textareaCls, btnPrimary, btnSecondary, SI_MONTHS,
} from "./ui";

export type AdminData = { requests: any[]; services: any[]; users: any[] };

export type Tab = "overview" | "requests" | "income" | "services" | "users" | "settings" | "more";
type Filter = "todo" | "all" | Stage;

const PAGE_SIZE = 30;
const SERVICE_ICONS: Record<string, typeof Star> = { Star, Heart, Book, Sparkles };

const TITLES: Record<Tab, string> = {
  overview: "මුල් පිටුව",
  requests: "ඉල්ලීම්",
  income: "ආදායම",
  services: "සේවාවන්",
  users: "පරිශීලකයින්",
  settings: "සැකසුම්",
  more: "තවත්",
};

const sameUser = (r: any, id: string) => r.user?._id === id || r.user === id;

export default function AdminApp({
  data,
  admin,
  refreshing,
  onRefresh,
  reloadRequests,
  reloadServices,
  initialTab = "overview",
  initialOpenId = null,
}: {
  initialTab?: Tab;
  initialOpenId?: string | null;
  data: AdminData;
  admin: { name?: string | null; image?: string | null };
  refreshing: boolean;
  onRefresh: () => void;
  reloadRequests: () => Promise<void>;
  reloadServices: () => Promise<void>;
}) {
  const { requests, services, users } = data;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [filter, setFilter] = useState<Filter>("todo");
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState<any | null>(null);
  const [newestFirst, setNewestFirst] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState<string | null>(initialOpenId);
  const [serviceForm, setServiceForm] = useState<any | null>(null);
  const [greeting, setGreeting] = useState({ hello: "ආයුබෝවන්", date: "" });
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting({ hello: h < 12 ? "සුභ උදෑසනක්" : h < 18 ? "සුභ දහවලක්" : "සුභ සන්ධ්‍යාවක්", date: sinhalaDate() });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  /* ── Derived ──────────────────────────────────────────────────────── */
  const rows = useMemo(() => requests.map((r) => ({ ...r, _stage: stageOf(r) as Stage })), [requests]);
  const openRequest = useMemo(() => requests.find((r) => r._id === openId) || null, [requests, openId]);

  const counts = useMemo(() => {
    const c: Record<Stage, number> = { new: 0, awaiting_payment: 0, verify_payment: 0, in_progress: 0, completed: 0, cancelled: 0 };
    rows.forEach((r) => c[r._stage as Stage]++);
    return c;
  }, [rows]);
  const isTodo = (s: Stage) => s === "new" || s === "verify_payment" || s === "in_progress";
  const todo = counts.new + counts.verify_payment + counts.in_progress;

  const approved = useMemo(() => requests.filter((r) => r.paymentStatus === "approved"), [requests]);
  const income = useMemo(() => {
    const now = new Date();
    let total = 0;
    let month = 0;
    approved.forEach((r) => {
      const p = parsePrice(priceOf(r, services));
      total += p;
      const d = new Date(r.updatedAt || r.createdAt);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) month += p;
    });
    return { total, month };
  }, [approved, services]);

  const todoList = useMemo(
    () =>
      rows
        .filter((r) => isTodo(r._stage))
        .sort((a, b) => STAGE_ORDER.indexOf(a._stage) - STAGE_ORDER.indexOf(b._stage) || +new Date(a.createdAt) - +new Date(b.createdAt)),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (filter === "todo" && !isTodo(r._stage)) return false;
      if (filter !== "todo" && filter !== "all" && r._stage !== filter) return false;
      if (userFilter && !sameUser(r, userFilter._id)) return false;
      if (!q) return true;
      return [r.user?.name, r.user?.email, r.serviceName, r.birthPlace].filter(Boolean).some((v: string) => v.toLowerCase().includes(q));
    });
    return list.sort((a, b) => {
      const diff = +new Date(a.createdAt) - +new Date(b.createdAt);
      if (filter === "todo") return STAGE_ORDER.indexOf(a._stage) - STAGE_ORDER.indexOf(b._stage) || diff;
      return newestFirst ? -diff : diff;
    });
  }, [rows, filter, userFilter, search, newestFirst]);

  const go = (t: Tab) => {
    setTab(t);
    setVisible(PAGE_SIZE);
  };
  const showRequests = (f: Filter, user: any = null) => {
    setFilter(f);
    setUserFilter(user);
    setSearch("");
    go("requests");
  };

  const exportCSV = () =>
    downloadCSV(`requests-${fmtDate(new Date())}.csv`, [
      ["නම", "ඊමේල්", "සේවාව", "මුදල", "තත්ත්වය", "උපන් දිනය", "උපන් වේලාව", "උපන් ස්ථානය", "ලැබුණු දිනය"],
      ...filtered.map((r) => [
        r.user?.name || "", r.user?.email || "", r.serviceName || "", priceOf(r, services), STAGE_META[r._stage as Stage].label,
        r.birthDate || "", r.birthTime || "", r.birthPlace || "", fmtDate(r.createdAt, true),
      ]),
    ]);

  const NAV: { id: Tab; label: string; icon: typeof Home; badge?: number }[] = [
    { id: "overview", label: "මුල් පිටුව", icon: Home },
    { id: "requests", label: "ඉල්ලීම්", icon: FileText, badge: todo },
    { id: "income", label: "ආදායම", icon: Wallet },
    { id: "services", label: "සේවාවන්", icon: Sparkles },
    { id: "users", label: "පරිශීලකයින්", icon: Users },
    { id: "settings", label: "සැකසුම්", icon: Settings },
  ];
  const MOBILE_NAV = [...NAV.slice(0, 4), { id: "more" as Tab, label: "තවත්", icon: MoreHorizontal }];
  const mobileActive = tab === "users" || tab === "settings" ? "more" : tab;

  /* ── Top bar actions per tab ──────────────────────────────────────── */
  const actions = (
    <div className="flex items-center gap-1.5">
      {tab === "requests" && (
        <IconButton label="CSV ලෙස බාගන්න" onClick={exportCSV} disabled={!filtered.length}>
          <Download className="w-5 h-5" />
        </IconButton>
      )}
      {tab === "services" && (
        <span className="hidden lg:block">
          <button onClick={() => setServiceForm({})} className={`${btnPrimary} !h-10 !px-4 text-sm`}>
            <Plus className="w-4 h-4" /> නව සේවාවක්
          </button>
        </span>
      )}
      <IconButton label="යාවත්කාලීන කරන්න" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
      </IconButton>
    </div>
  );

  return (
    <div className="admin-app min-h-[100dvh] bg-[#060a14] text-gray-100 lg:flex">
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-[100dvh] sticky top-0 border-r border-white/[0.06] bg-[#080d1a] px-4 py-5">
        <Link href="/" className="flex items-center gap-3 px-2 mb-8">
          <img src="/horoscope-result-1.png" alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-gold-500/40" />
          <span className="leading-tight">
            <span className="block font-serif font-bold text-gold-200">සුභද්‍රා ජ්‍යෝතිෂ්‍ය</span>
            <span className="block text-xs text-gray-500">පරිපාලක පුවරුව</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-1" aria-label="පරිපාලක මෙනුව">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              aria-current={tab === n.id ? "page" : undefined}
              className={`flex items-center gap-3 h-11 px-3 rounded-xl text-[15px] transition-colors ${
                tab === n.id ? "bg-gold-400/12 text-gold-100" : "text-gray-400 hover:text-gray-100 hover:bg-white/[0.04]"
              }`}
            >
              <n.icon className={`w-[18px] h-[18px] ${tab === n.id ? "text-gold-300" : ""}`} />
              <span className="flex-1 text-left">{n.label}</span>
              {!!n.badge && <span className="min-w-6 h-6 px-1.5 grid place-items-center rounded-full bg-gold-400 text-[#1a1304] text-xs font-bold">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-white/[0.06] space-y-1">
          <Link href="/" className="flex items-center gap-3 h-11 px-3 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-white/[0.04]">
            <Globe className="w-[18px] h-[18px]" /> වෙබ් අඩවිය
          </Link>
          <div className="flex items-center gap-3 px-3 pt-3">
            <Avatar name={admin.name || "Admin"} image={admin.image || undefined} size={34} />
            <span className="flex-1 min-w-0 text-sm text-gray-200 truncate">{admin.name}</span>
            <button onClick={() => signOut({ callbackUrl: "/" })} aria-label="ඉවත් වන්න" className="grid place-items-center w-9 h-9 rounded-lg text-gray-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* ── Top bar ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-[#060a14]/85 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-3 h-14 lg:h-16 px-4 lg:px-8 max-w-6xl">
            <img src="/horoscope-result-1.png" alt="" className="lg:hidden w-8 h-8 rounded-full object-cover ring-1 ring-gold-500/40" />
            <h1 className="flex-1 text-lg lg:text-xl font-semibold text-white truncate">{TITLES[tab]}</h1>
            {actions}
          </div>
        </header>

        <main className="px-4 lg:px-8 pt-4 lg:pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-12 max-w-6xl">
          {/* ═══════════ OVERVIEW ═══════════ */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-400">{greeting.date}</p>
                <h2 className="text-2xl lg:text-3xl font-semibold text-white mt-0.5">
                  {greeting.hello}, {(admin.name || "").split(" ").slice(-1)[0] || "Admin"}
                </h2>
              </div>

              {/* Action hero */}
              {todo > 0 ? (
                <button
                  onClick={() => showRequests("todo")}
                  className="w-full text-left rounded-3xl p-5 lg:p-6 bg-gradient-to-br from-[#f2dd9c] via-[#e7c65a] to-[#c99a2e] text-[#1a1304] shadow-[0_20px_50px_-20px_rgba(231,198,90,0.55)] active:scale-[0.99] transition-transform"
                >
                  <p className="text-sm font-medium opacity-75">ඔබ කළ යුතු දේ</p>
                  <p className="text-4xl font-bold mt-1 tabular-nums">{todo}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-sm font-medium">
                    {counts.verify_payment > 0 && <span className="px-3 py-1 rounded-full bg-black/10">ගෙවීම් තහවුරු කිරීමට {counts.verify_payment}</span>}
                    {counts.new > 0 && <span className="px-3 py-1 rounded-full bg-black/10">අලුත් ඉල්ලීම් {counts.new}</span>}
                    {counts.in_progress > 0 && <span className="px-3 py-1 rounded-full bg-black/10">ප්‍රතිඵල යැවීමට {counts.in_progress}</span>}
                  </div>
                  <span className="inline-flex items-center gap-2 mt-5 h-11 px-5 rounded-xl bg-[#1a1304] text-gold-200 font-semibold">
                    ආරම්භ කරන්න <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              ) : (
                <div className="rounded-3xl p-5 lg:p-6 bg-emerald-500/10 border border-emerald-400/20 flex items-center gap-4">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-emerald-400/15 text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">සියල්ල අවසන්!</p>
                    <p className="text-sm text-gray-300">තහවුරු කිරීමට හෝ යැවීමට කිසිවක් නැත.</p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat label="මෙම මාසය" value={rupees(income.month)} onClick={() => go("income")} />
                <Stat label="මුළු ආදායම" value={rupees(income.total)} onClick={() => go("income")} />
                <Stat label="ඉල්ලීම්" value={String(requests.length)} onClick={() => showRequests("all")} />
                <Stat label="පරිශීලකයින්" value={String(users.length)} onClick={() => go("users")} />
              </div>

              {/* Pipeline */}
              <section>
                <SectionTitle>ඉල්ලීම් තත්ත්වය</SectionTitle>
                <div className={`${card} divide-y divide-white/[0.06]`}>
                  {(["new", "verify_payment", "in_progress", "awaiting_payment", "completed"] as Stage[]).map((s) => (
                    <button key={s} onClick={() => showRequests(s)} className="w-full flex items-center gap-3 px-4 h-14 text-left hover:bg-white/[0.03]">
                      <span className={`w-2.5 h-2.5 rounded-full ${STAGE_META[s].dot}`} />
                      <span className="flex-1 text-[15px] text-gray-200">{STAGE_META[s].label}</span>
                      <span className="text-[15px] font-semibold text-white tabular-nums">{counts[s]}</span>
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Queue */}
              {todoList.length > 0 && (
                <section>
                  <SectionTitle action={<TextLink onClick={() => showRequests("todo")}>සියල්ල</TextLink>}>ඊළඟට කළ යුතු</SectionTitle>
                  <div className="space-y-2.5">
                    {todoList.slice(0, 4).map((r) => (
                      <RequestCard key={r._id} r={r} services={services} onOpen={() => setOpenId(r._id)} />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <SectionTitle action={<TextLink onClick={() => showRequests("all")}>සියල්ල</TextLink>}>මෑත ඉල්ලීම්</SectionTitle>
                {rows.length === 0 ? (
                  <div className={card}>
                    <EmptyState icon={<Inbox className="w-6 h-6" />} title="තවම ඉල්ලීම් නැත" hint="පාරිභෝගිකයින් සේවාවක් ඉල්ලූ විට මෙහි පෙන්වයි." />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {rows.slice(0, 5).map((r) => (
                      <RequestCard key={r._id} r={r} services={services} onOpen={() => setOpenId(r._id)} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══════════ REQUESTS ═══════════ */}
          {tab === "requests" && (
            <div>
              <div className="sticky top-14 lg:top-16 z-30 -mx-4 lg:-mx-8 px-4 lg:px-8 pt-1 pb-3 bg-[#060a14]/90 backdrop-blur-xl">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setVisible(PAGE_SIZE);
                    }}
                    placeholder="නම, ඊමේල් හෝ සේවාව සොයන්න"
                    className={`${inputCls} !pl-12 !pr-10`}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} aria-label="සෙවුම මකන්න" className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-8 h-8 rounded-full text-gray-400 hover:bg-white/10">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-4 px-4 lg:mx-0 lg:px-0">
                  {([
                    ["todo", "කළ යුතු", todo],
                    ["all", "සියල්ල", requests.length],
                    ["new", STAGE_META.new.short, counts.new],
                    ["verify_payment", STAGE_META.verify_payment.short, counts.verify_payment],
                    ["in_progress", STAGE_META.in_progress.short, counts.in_progress],
                    ["awaiting_payment", STAGE_META.awaiting_payment.short, counts.awaiting_payment],
                    ["completed", STAGE_META.completed.short, counts.completed],
                  ] as [Filter, string, number][]).map(([id, label, n]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setFilter(id);
                        setVisible(PAGE_SIZE);
                      }}
                      aria-pressed={filter === id}
                      className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm transition-colors ${
                        filter === id ? "bg-white text-[#060a14] font-semibold" : "bg-white/[0.06] text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {label}
                      <span className={`tabular-nums ${filter === id ? "text-[#060a14]/60" : "text-gray-500"}`}>{n}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 mt-3 text-sm">
                  {userFilter ? (
                    <span className="inline-flex items-center gap-2 h-8 pl-3 pr-1 rounded-full bg-gold-400/12 text-gold-100 min-w-0">
                      <span className="truncate">{userFilter.name}</span>
                      <button onClick={() => setUserFilter(null)} aria-label="පෙරහන ඉවත් කරන්න" className="grid place-items-center w-6 h-6 rounded-full hover:bg-white/10 shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ) : (
                    <span className="text-gray-500">{filtered.length} ක්</span>
                  )}
                  {filter !== "todo" && (
                    <button onClick={() => setNewestFirst((v) => !v)} className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white shrink-0">
                      <ArrowUpDown className="w-4 h-4" /> {newestFirst ? "අලුත්ම" : "පැරණිම"}
                    </button>
                  )}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className={`${card} mt-2`}>
                  <EmptyState
                    icon={filter === "todo" && !search ? <CheckCircle2 className="w-6 h-6" /> : <Inbox className="w-6 h-6" />}
                    title={search || userFilter ? "ගැලපෙන ඉල්ලීම් නැත" : filter === "todo" ? "සියල්ල අවසන්!" : "මෙහි ඉල්ලීම් නැත"}
                    hint={search ? "වෙනත් වචනයකින් සොයා බලන්න." : undefined}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 mt-1">
                  {filtered.slice(0, visible).map((r) => (
                    <RequestCard key={r._id} r={r} services={services} onOpen={() => setOpenId(r._id)} />
                  ))}
                </div>
              )}
              {visible < filtered.length && (
                <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className={`${btnSecondary} w-full mt-4`}>
                  තවත් පෙන්වන්න ({filtered.length - visible})
                </button>
              )}
            </div>
          )}

          {/* ═══════════ INCOME ═══════════ */}
          {tab === "income" && <IncomeView approved={approved} services={services} total={income.total} onOpen={setOpenId} />}

          {/* ═══════════ SERVICES ═══════════ */}
          {tab === "services" && <ServicesView services={services} reload={reloadServices} onEdit={setServiceForm} />}

          {/* ═══════════ USERS ═══════════ */}
          {tab === "users" && <UsersView users={users} requests={requests} onShowRequests={(u) => showRequests("all", u)} />}

          {/* ═══════════ SETTINGS ═══════════ */}
          {tab === "settings" && (
            <div className={`${card} p-4 sm:p-6`}>
              <AdminSettings />
            </div>
          )}

          {/* ═══════════ MORE (phones) ═══════════ */}
          {tab === "more" && (
            <div className="space-y-6">
              <div className={`${card} p-4 flex items-center gap-3`}>
                <Avatar name={admin.name || "Admin"} image={admin.image || undefined} size={48} />
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{admin.name}</p>
                  <p className="text-sm text-gray-400">පරිපාලක</p>
                </div>
              </div>
              <div className={`${card} divide-y divide-white/[0.06]`}>
                <MenuRow icon={Users} label="පරිශීලකයින්" value={String(users.length)} onClick={() => go("users")} />
                <MenuRow icon={Settings} label="සැකසුම්" onClick={() => go("settings")} />
                <MenuRow icon={Globe} label="වෙබ් අඩවිය බලන්න" href="/" />
              </div>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-red-500/10 text-red-300 font-semibold">
                <LogOut className="w-5 h-5" /> ඉවත් වන්න
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile bottom navigation ─────────────────────────────────── */}
      <nav
        aria-label="පරිපාලක මෙනුව"
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#080d1a]/95 backdrop-blur-xl border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16">
          {MOBILE_NAV.map((n) => {
            const active = mobileActive === n.id;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center justify-center gap-1 text-[11px] ${active ? "text-gold-200" : "text-gray-500"}`}
              >
                <span className={`relative grid place-items-center w-14 h-8 rounded-full transition-colors ${active ? "bg-gold-400/15" : ""}`}>
                  <n.icon className="w-[21px] h-[21px]" />
                  {"badge" in n && !!n.badge && (
                    <span className="absolute -top-1 right-2 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-gold-400 text-[#1a1304] text-[10px] font-bold">
                      {n.badge}
                    </span>
                  )}
                </span>
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile "add service" button */}
      {tab === "services" && (
        <button
          onClick={() => setServiceForm({})}
          aria-label="නව සේවාවක්"
          className="lg:hidden fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 grid place-items-center w-14 h-14 rounded-2xl bg-gold-400 text-[#1a1304] shadow-[0_12px_30px_-8px_rgba(231,198,90,0.6)] active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <RequestDrawer request={openRequest} services={services} onClose={() => setOpenId(null)} onChanged={reloadRequests} />
      <ServiceForm service={serviceForm} onClose={() => setServiceForm(null)} reload={reloadServices} />
    </div>
  );
}

/* ───────────────────────────── Building blocks ───────────────────────────── */

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid place-items-center w-10 h-10 rounded-full text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <h3 className="text-[15px] font-semibold text-white">{children}</h3>
      {action}
    </div>
  );
}

function TextLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-0.5 text-sm text-gold-300 hover:text-gold-100">
      {children} <ChevronRight className="w-4 h-4" />
    </button>
  );
}

function Stat({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`${card} ${cardHover} text-left p-4`}>
      <span className="text-sm text-gray-400">{label}</span>
      <span className="block text-xl lg:text-2xl font-bold text-white mt-1 tabular-nums truncate">{value}</span>
    </button>
  );
}

function RequestCard({ r, services, onOpen }: { r: any; services: any[]; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className={`${card} ${cardHover} w-full text-left p-4 flex gap-3.5 active:scale-[0.99] transition-transform ${r._stage === "new" ? "ring-1 ring-violet-400/40" : ""}`}
    >
      <Avatar name={r.user?.name} image={r.user?.image} size={44} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-white truncate">{r.user?.name || "නොදන්නා"}</p>
          <span className="text-sm font-semibold text-gray-200 tabular-nums whitespace-nowrap">{priceOf(r, services)}</span>
        </div>
        <p className="text-sm text-gray-400 truncate mt-0.5">{r.serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම"}</p>
        {(r.contactNumber || r.user?.email) && (
          <p className="text-xs text-gray-500 truncate">{[r.contactNumber, r.user?.email].filter(Boolean).join(" · ")}</p>
        )}
        {r.note && <p className="text-xs text-amber-300/80 truncate mt-1">📝 {r.note}</p>}
        {(r.birthDate || r.birthPlace) && (
          <p className="text-xs text-gray-500 truncate mt-1">
            {[r.birthDate, r.birthTime, r.birthPlace].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 mt-2.5">
          <StageBadge stage={r._stage} short />
          <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(r.createdAt)}</span>
        </div>
      </div>
    </button>
  );
}

function MenuRow({ icon: Icon, label, value, onClick, href }: { icon: typeof Home; label: string; value?: string; onClick?: () => void; href?: string }) {
  const inner = (
    <>
      <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/[0.06] text-gray-300">
        <Icon className="w-[18px] h-[18px]" />
      </span>
      <span className="flex-1 text-[15px] text-gray-100">{label}</span>
      {value && <span className="text-sm text-gray-500">{value}</span>}
      <ChevronRight className="w-4 h-4 text-gray-600" />
    </>
  );
  const cls = "w-full flex items-center gap-3 px-4 h-14 text-left hover:bg-white/[0.03]";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/* ───────────────────────────── Views ───────────────────────────── */

function IncomeView({ approved, services, total, onOpen }: { approved: any[]; services: any[]; total: number; onOpen: (id: string) => void }) {
  const [monthKey, setMonthKey] = useState("all");
  const keyOf = (r: any) => fmtDate(r.updatedAt || r.createdAt).slice(0, 7);
  const months = useMemo(() => Array.from(new Set(approved.map(keyOf))).sort().reverse(), [approved]);
  const label = (k: string) => `${SI_MONTHS[Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`;

  const list = useMemo(
    () =>
      approved
        .filter((r) => monthKey === "all" || keyOf(r) === monthKey)
        .sort((a, b) => +new Date(b.updatedAt || b.createdAt) - +new Date(a.updatedAt || a.createdAt)),
    [approved, monthKey]
  );
  const sum = list.reduce((s, r) => s + parsePrice(priceOf(r, services)), 0);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 lg:p-6 bg-gradient-to-br from-[#14203f] to-[#0d1426] border border-white/[0.07]">
        <p className="text-sm text-gray-400">{monthKey === "all" ? "මුළු ආදායම" : label(monthKey)}</p>
        <p className="text-3xl lg:text-4xl font-bold text-white mt-1 tabular-nums">{rupees(monthKey === "all" ? total : sum)}</p>
        <p className="text-sm text-gray-400 mt-1">අනුමත ගෙවීම් {list.length}</p>
        <button
          onClick={() =>
            downloadCSV(`income-${monthKey}.csv`, [
              ["දිනය", "නම", "ඊමේල්", "සේවාව", "මුදල"],
              ...list.map((r) => [fmtDate(r.updatedAt || r.createdAt), r.user?.name || "", r.user?.email || "", r.serviceName || "", parsePrice(priceOf(r, services))]),
            ])
          }
          disabled={!list.length}
          className={`${btnSecondary} !h-10 text-sm mt-4`}
        >
          <Download className="w-4 h-4" /> CSV බාගන්න
        </button>
      </div>

      {months.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          {["all", ...months].map((m) => (
            <button
              key={m}
              onClick={() => setMonthKey(m)}
              aria-pressed={monthKey === m}
              className={`shrink-0 h-9 px-3.5 rounded-full text-sm ${monthKey === m ? "bg-white text-[#060a14] font-semibold" : "bg-white/[0.06] text-gray-300"}`}
            >
              {m === "all" ? "සියල්ල" : label(m)}
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className={card}>
          <EmptyState icon={<Wallet className="w-6 h-6" />} title="අනුමත ගෙවීම් නැත" hint="ඔබ ගෙවීමක් අනුමත කළ විට මෙහි පෙන්වයි." />
        </div>
      ) : (
        <div className={`${card} divide-y divide-white/[0.06]`}>
          {list.map((r) => (
            <button key={r._id} onClick={() => onOpen(r._id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03]">
              <Avatar name={r.user?.name} image={r.user?.image} size={38} />
              <span className="flex-1 min-w-0">
                <span className="block text-[15px] text-white truncate">{r.user?.name || "නොදන්නා"}</span>
                <span className="block text-xs text-gray-500 truncate">
                  {r.serviceName} · {fmtDate(r.updatedAt || r.createdAt)}
                </span>
              </span>
              <span className="text-[15px] font-semibold text-emerald-300 tabular-nums whitespace-nowrap">+{priceOf(r, services)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesView({ services, reload, onEdit }: { services: any[]; reload: () => Promise<void>; onEdit: (s: any) => void }) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (s: any) => {
    setBusyId(s._id);
    const res = await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s._id, isActive: s.isActive === false }),
    });
    if (res.ok) {
      toast.success(s.isActive === false ? "සේවාව දැන් වෙබ් අඩවියේ පෙන්වයි" : "සේවාව සඟවන ලදී");
      await reload();
    } else toast.error("වෙනස් කිරීම අසාර්ථකයි");
    setBusyId(null);
  };

  if (services.length === 0) {
    return (
      <div className={card}>
        <EmptyState
          icon={<Sparkles className="w-6 h-6" />}
          title="සේවාවන් නැත"
          hint="පළමු සේවාව එක් කරන්න."
          action={
            <button onClick={() => onEdit({})} className={btnPrimary}>
              <Plus className="w-4 h-4" /> නව සේවාවක්
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400">ස්විචය අක්‍රිය කළ සේවාවන් වෙබ් අඩවියේ නොපෙන්වයි.</p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {services.map((s) => {
          const Icon = SERVICE_ICONS[s.iconName] || Sparkles;
          const active = s.isActive !== false;
          return (
            <div key={s._id} className={`${card} p-4`}>
              <div className="flex items-start gap-3.5">
                <span className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 ${active ? "bg-gold-400/12 text-gold-300" : "bg-white/[0.05] text-gray-500"}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${active ? "text-white" : "text-gray-400"}`}>{s.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    <span className="text-gold-200">{s.price}</span> · {s.duration}
                  </p>
                </div>
                {busyId === s._id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
                ) : (
                  <Switch checked={active} onChange={() => toggle(s)} label={active ? "සේවාව සඟවන්න" : "සේවාව පෙන්වන්න"} />
                )}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mt-3 line-clamp-2">{s.description}</p>
              <button onClick={() => onEdit(s)} className={`${btnSecondary} !h-10 text-sm w-full mt-4`}>
                <Pencil className="w-4 h-4" /> සංස්කරණය කරන්න
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const EMPTY_SERVICE = { title: "", description: "", price: "", duration: "", iconName: "Sparkles" };

function ServiceForm({ service, onClose, reload }: { service: any | null; onClose: () => void; reload: () => Promise<void> }) {
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);
  const isEdit = !!service?._id;

  useEffect(() => {
    if (!service) return;
    setForm(
      service._id
        ? { title: service.title, description: service.description, price: service.price, duration: service.duration, iconName: service.iconName || "Sparkles" }
        : EMPTY_SERVICE
    );
  }, [service]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/services", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(isEdit ? { id: service._id } : {}) }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message);
      toast.success(isEdit ? "සේවාව යාවත්කාලීන කළා" : "නව සේවාව එක් කළා");
      onClose();
      await reload();
    } catch (err: any) {
      toast.error(err?.message || "සුරැකීම අසාර්ථකයි");
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, el: ReactNode) => (
    <label className="block">
      <span className="block text-sm text-gray-400 mb-1.5">{label}</span>
      {el}
    </label>
  );

  return (
    <Modal open={!!service} onClose={onClose} title={isEdit ? "සේවාව සංස්කරණය" : "නව සේවාවක්"}>
      <form onSubmit={save} className="space-y-4">
        {field("සේවා නාමය", <input className={inputCls} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="උදා: පොරොන්දම් ගැලපීම" />)}
        <div className="grid grid-cols-2 gap-3">
          {field("මිල", <input className={inputCls} required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="රු. 3000" />)}
          {field("කාලසීමාව", <input className={inputCls} required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="විනාඩි 60" />)}
        </div>
        {field(
          "අයිකනය",
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(SERVICE_ICONS).map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => setForm({ ...form, iconName: name })}
                aria-pressed={form.iconName === name}
                aria-label={name}
                className={`h-12 rounded-xl grid place-items-center transition-colors ${
                  form.iconName === name ? "bg-gold-400/15 text-gold-200 ring-2 ring-gold-400/60" : "bg-white/[0.05] text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        )}
        {field("විස්තරය", <textarea className={textareaCls} rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="සේවාව පිළිබඳ කෙටි හැඳින්වීමක්…" />)}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            අවලංගු කරන්න
          </button>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "සුරකින්න" : "එක් කරන්න"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UsersView({ users, requests, onShowRequests }: { users: any[]; requests: any[]; onShowRequests: (u: any) => void }) {
  const [q, setQ] = useState("");
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    requests.forEach((r) => {
      const id = r.user?._id || r.user;
      if (id) m.set(id, (m.get(id) || 0) + 1);
    });
    return m;
  }, [requests]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users.filter((u) => !s || [u.name, u.email].filter(Boolean).some((v: string) => v.toLowerCase().includes(s)));
  }, [users, q]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="නම හෝ ඊමේල් සොයන්න" className={`${inputCls} !pl-12`} />
      </div>
      {list.length === 0 ? (
        <div className={card}>
          <EmptyState icon={<Users className="w-6 h-6" />} title={q ? "ගැලපෙන අය නැත" : "පරිශීලකයින් නැත"} />
        </div>
      ) : (
        <div className={`${card} divide-y divide-white/[0.06]`}>
          {list.map((u) => {
            const n = counts.get(u._id) || 0;
            return (
              <button
                key={u._id}
                onClick={() => n > 0 && onShowRequests(u)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${n > 0 ? "hover:bg-white/[0.03]" : "cursor-default"}`}
              >
                <Avatar name={u.name} image={u.image} size={42} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] text-white truncate">{u.name}</span>
                    {u.role === "admin" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/15 text-emerald-300 shrink-0">ADMIN</span>}
                  </span>
                  <span className="block text-xs text-gray-500 truncate">{u.email}</span>
                </span>
                <span className="text-right shrink-0">
                  <span className="block text-sm text-gray-200">ඉල්ලීම් {n}</span>
                  <span className="block text-xs text-gray-500">{fmtDate(u.createdAt)}</span>
                </span>
                {n > 0 && <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
