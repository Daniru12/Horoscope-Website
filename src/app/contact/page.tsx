"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, AlertCircle } from "lucide-react";

const WHATSAPP_NUMBER = "94711038064";
const CONTACT_EMAIL = "info@subadra-astrology.com";
const CONTACT_MOBILE = "0711 038 064";

function buildWhatsAppUrl(name: string, email: string, service: string, message: string) {
  const parts: string[] = [];
  parts.push("🌟 *සුභද්‍රා ජ්‍යෝතිෂ්‍ය - Contact Form*");
  parts.push("----------------------------");
  parts.push(`👤 *නම:* ${name.trim()}`);
  if (email.trim())   parts.push(`📧 *Email:* ${email.trim()}`);
  if (service)        parts.push(`⭐ *සේවාව:* ${service}`);
  parts.push(`💬 *පණිවිඩය:* ${message.trim()}`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(parts.join("\n"))}`;
}

export default function ContactPage() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false); // track if user tried to send

  // Validation: name and message are required
  const nameError    = submitted && name.trim() === "";
  const messageError = submitted && message.trim() === "";
  const isValid      = name.trim() !== "" && message.trim() !== "";

  const whatsappBase = `https://wa.me/${WHATSAPP_NUMBER}`;

  const handleClick = () => {
    setSubmitted(true);
    if (!isValid) return; // show errors, don't navigate

    // Build the URL fresh at click-time from current live state
    const url = buildWhatsAppUrl(name, email, service, message);
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 sm:mb-6">
          අප හා සම්බන්ධ වන්න
        </h1>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
          තරු ඔබ වෙනුවෙන් ගෙන එන්නේ කුමක්දැයි සොයා බැලීමට සූදානම්ද? වේලාවක් වෙන්කරවා ගැනීමට හෝ
          කිසියම් ප්‍රශ්නයක් ඇසීමට අප හා සම්බන්ධ වන්න.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* ── Contact Info sidebar ─────────────────────────────────── */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 sm:gap-6">
          {/* Phone */}
          <div className="bg-space-800/50 border border-space-700 p-5 sm:p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-space-700 p-3 rounded-full text-gold-400 flex-shrink-0">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">දුරකථනය</h3>
              <p className="text-gray-400 mb-1">{CONTACT_MOBILE}</p>
              <p className="text-xs text-gray-500">සඳුදා සිට සිකුරාදා — පෙ.ව. 9 සිට ප.ව. 6</p>
            </div>
          </div>

          {/* WhatsApp direct */}
          <div className="bg-space-800/50 border border-space-700 p-5 sm:p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-space-700 p-3 rounded-full text-green-400 flex-shrink-0">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">වට්ස්ඇප්</h3>
              <p className="text-gray-400 mb-3">{CONTACT_MOBILE}</p>
              <a
                href={whatsappBase}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                දැන් WhatsApp කරන්න
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="bg-space-800/50 border border-space-700 p-5 sm:p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-space-700 p-3 rounded-full text-gold-400 flex-shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold mb-1">විද්‍යුත් තැපෑල</h3>
              <p className="text-gray-400 break-all text-sm">{CONTACT_EMAIL}</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-space-800/50 border border-space-700 p-5 sm:p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-space-700 p-3 rounded-full text-gold-400 flex-shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">ස්ථානය</h3>
              <p className="text-gray-400 text-sm">ශ්‍රී ලංකාව</p>
            </div>
          </div>
        </div>

        {/* ── Contact Form ──────────────────────────────────────────── */}
        <div className="w-full lg:w-2/3">
          <div className="bg-space-800/80 border border-space-700 p-6 md:p-10 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  WhatsApp හරහා පණිවිඩ යවන්න
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  පෝරමය පුරවා "යවන්න" click කරන්න — WhatsApp හරහා message යනු ලැබේ
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name — REQUIRED */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="wa-name" className="text-sm font-medium text-gray-300 flex items-center gap-1">
                    සම්පූර්ණ නම
                    <span className="text-red-400 text-base leading-none">*</span>
                  </label>
                  <input
                    id="wa-name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (submitted) setSubmitted(false); }}
                    className={`bg-space-900 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      nameError
                        ? "border-red-500 focus:border-red-400 ring-1 ring-red-500/50"
                        : "border-space-600 focus:border-gold-500"
                    }`}
                    placeholder="ඔබගේ නම ඇතුලත් කරන්න"
                  />
                  {nameError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-400 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      නම අවශ්‍යයි (Name is required)
                    </p>
                  )}
                </div>

                {/* Email — optional */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="wa-email" className="text-sm font-medium text-gray-300">
                    ඊමේල් <span className="text-gray-500 text-xs">(විකල්ප)</span>
                  </label>
                  <input
                    id="wa-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-space-900 border border-space-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Service — optional */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wa-service" className="text-sm font-medium text-gray-300">
                  අවශ්‍ය සේවාව <span className="text-gray-500 text-xs">(විකල්ප)</span>
                </label>
                <div className="relative">
                  <select
                    id="wa-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-space-900 border border-space-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none pr-10"
                  >
                    <option value="">සේවාවක් තෝරන්න...</option>
                    <option value="පෞද්ගලික කේන්දර පරීක්ෂාව">පෞද්ගලික කේන්දර පරීක්ෂාව</option>
                    <option value="පොරොන්දම් ගැලපීම">පොරොන්දම් ගැලපීම</option>
                    <option value="නාමකරණය සහ අංක විද්‍යාව">නාමකරණය සහ අංක විද්‍යාව</option>
                    <option value="වාර්ෂික පලාපල">වාර්ෂික පලාපල</option>
                    <option value="වෙනත් විමසීමක්">වෙනත් විමසීමක්</option>
                  </select>
                  {/* chevron icon */}
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message — REQUIRED */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wa-message" className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  ඔබගේ පණිවිඩය
                  <span className="text-red-400 text-base leading-none">*</span>
                </label>
                <textarea
                  id="wa-message"
                  rows={5}
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); if (submitted) setSubmitted(false); }}
                  className={`bg-space-900 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors resize-none ${
                    messageError
                      ? "border-red-500 focus:border-red-400 ring-1 ring-red-500/50"
                      : "border-space-600 focus:border-gold-500"
                  }`}
                  placeholder="අපට ඔබට උදව් කළ හැක්කේ කෙසේද? ඔබේ ප්‍රශ්නය, හෝ ඉල්ලුම ලියන්න..."
                />
                {messageError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    පණිවිඩය අවශ්‍යයි (Message is required)
                  </p>
                )}
              </div>

              {/* Required field note */}
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="text-red-400">*</span> ලකුණු කළ ක්ෂේත්‍ර අනිවාර්යයි
              </p>

              {/* Send button — button with onClick so URL is built fresh at click time */}
              <button
                type="button"
                onClick={handleClick}
                className={`w-full flex items-center justify-center gap-3 px-8 py-4 font-bold rounded-xl transition-all duration-300 text-base sm:text-lg mt-1 ${
                  isValid
                    ? "bg-green-500 hover:bg-green-400 active:bg-green-600 text-white transform hover:scale-[1.02] active:scale-100 shadow-lg shadow-green-900/30"
                    : "bg-green-500/40 text-white/60"
                }`}
              >
                {/* WhatsApp logo */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp හරහා යවන්න
              </button>

              {/* Validation summary shown after failed attempt */}
              {submitted && !isValid && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    කරුණාකර අනිවාර්ය ක්ෂේත්‍ර ({[nameError && "නම", messageError && "පණිවිඩය"].filter(Boolean).join(", ")}) පුරවා යළිත් උත්සාහ කරන්න.
                  </span>
                </div>
              )}

              <p className="text-center text-xs text-gray-500">
                ඔබගේ WhatsApp app හෝ web.whatsapp.com හරහා +94 711 038 064 වෙත පණිවිඩය යවනු ලැබේ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
