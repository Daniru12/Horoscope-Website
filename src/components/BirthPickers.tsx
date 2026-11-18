"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const MONTHS = [
  "ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි",
  "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්",
];

const pad = (n: number | string) => String(n).padStart(2, "0");

function Select({
  value, onChange, placeholder, children, label, invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full min-h-[52px] appearance-none bg-space-900/50 border rounded-xl pl-3 pr-9 text-base focus:outline-none focus:ring-2 transition-all cursor-pointer [color-scheme:dark] ${
          value ? "text-white" : "text-gray-500"
        } ${invalid ? "border-red-500/70 focus:ring-red-500/40" : "border-space-600 focus:ring-gold-500/50"}`}
      >
        <option value="" disabled className="bg-space-900 text-gray-400">{placeholder}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
    </div>
  );
}

/** Year / Month / Day dropdowns — no scrolling through calendars to reach 1985. */
export function BirthDatePicker({
  value, onChange, invalid,
}: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [y0, m0, d0] = value ? value.split("-") : ["", "", ""];
  const [y, setY] = useState(y0);
  const [m, setM] = useState(m0 ? String(Number(m0)) : "");
  const [d, setD] = useState(d0 ? String(Number(d0)) : "");

  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1899 }, (_, i) => thisYear - i);
  const daysIn = y && m ? new Date(Number(y), Number(m), 0).getDate() : 31;

  const emit = (ny: string, nm: string, nd: string) => {
    if (ny && nm && nd) onChange(`${ny}-${pad(nm)}-${pad(nd)}`);
    else onChange("");
  };

  const update = (ny: string, nm: string, nd: string) => {
    // Clamp day when the month shrinks (e.g. 31 → Feb)
    if (ny && nm && nd) {
      const max = new Date(Number(ny), Number(nm), 0).getDate();
      if (Number(nd) > max) nd = String(max);
    }
    setY(ny); setM(nm); setD(nd);
    emit(ny, nm, nd);
  };

  return (
    <div className="flex gap-2">
      <Select label="වර්ෂය" placeholder="වසර" value={y} invalid={invalid} onChange={(v) => update(v, m, d)}>
        {years.map((yr) => <option key={yr} value={yr} className="bg-space-900 text-white">{yr}</option>)}
      </Select>
      <Select label="මාසය" placeholder="මාසය" value={m} invalid={invalid} onChange={(v) => update(y, v, d)}>
        {MONTHS.map((name, i) => <option key={name} value={i + 1} className="bg-space-900 text-white">{name}</option>)}
      </Select>
      <Select label="දිනය" placeholder="දිනය" value={d} invalid={invalid} onChange={(v) => update(y, m, v)}>
        {Array.from({ length: daysIn }, (_, i) => i + 1).map((day) => (
          <option key={day} value={day} className="bg-space-900 text-white">{day}</option>
        ))}
      </Select>
    </div>
  );
}

/** Hour / Minute dropdowns + AM/PM toggle. Emits "hh:mm AM|PM" once complete. */
export function BirthTimePicker({
  value, onChange, invalid,
}: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const [h, setH] = useState(match ? String(Number(match[1])) : "");
  const [min, setMin] = useState(match ? match[2] : "");
  const [p, setP] = useState(match ? match[3].toUpperCase() : "");

  const update = (nh: string, nmin: string, np: string) => {
    setH(nh); setMin(nmin); setP(np);
    onChange(nh && nmin && np ? `${pad(nh)}:${nmin} ${np}` : "");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select label="පැය" placeholder="පැය" value={h} invalid={invalid} onChange={(v) => update(v, min, p)}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n} className="bg-space-900 text-white">{pad(n)}</option>
          ))}
        </Select>
        <span className="self-center text-xl text-gray-400 font-bold">:</span>
        <Select label="මිනිත්තු" placeholder="මිනි." value={min} invalid={invalid} onChange={(v) => update(h, v, p)}>
          {Array.from({ length: 60 }, (_, i) => pad(i)).map((n) => (
            <option key={n} value={n} className="bg-space-900 text-white">{n}</option>
          ))}
        </Select>
      </div>

      <div
        role="radiogroup"
        aria-label="පෙරවරු / පස්වරු"
        className={`grid grid-cols-2 gap-2 p-1 rounded-xl border bg-space-900/50 ${invalid ? "border-red-500/70" : "border-space-600"}`}
      >
        {[
          { v: "AM", t: "පෙරවරු", s: "AM • රාත්‍රී 12 – දහවල් 12" },
          { v: "PM", t: "පස්වරු", s: "PM • දහවල් 12 – රාත්‍රී 12" },
        ].map((o) => (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={p === o.v}
            onClick={() => update(h, min, o.v)}
            className={`min-h-[48px] rounded-lg px-2 py-1.5 text-center transition-colors ${
              p === o.v ? "bg-gold-500 text-space-900" : "text-gray-300 hover:bg-space-700"
            }`}
          >
            <span className="block font-bold leading-tight">{o.t}</span>
            <span className={`block text-[10px] leading-tight ${p === o.v ? "text-space-900/70" : "text-gray-500"}`}>{o.s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
