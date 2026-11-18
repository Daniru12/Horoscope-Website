import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

/** "0771234567" / "+94 77 123 4567" → "+94771234567" (E.164, what TextBee expects). Returns "" if unusable. */
export function toInternational(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("94") && digits.length === 11) return "+" + digits;
  if (digits.startsWith("0") && digits.length === 10) return "+94" + digits.slice(1);
  if (digits.length === 9) return "+94" + digits;
  return "";
}

/** Admin alert number: Settings page → SMS_ADMIN_NUMBER env → Settings contact mobile. */
async function adminSettings(): Promise<{ enabled: boolean; number: string }> {
  try {
    await connectToDatabase();
    const s: any = await Setting.findOne();
    const number =
      toInternational(s?.smsNumber || "") || toInternational(process.env.SMS_ADMIN_NUMBER || "") || toInternational(s?.mobileNumber || "");
    return { enabled: s?.smsEnabled !== false, number };
  } catch {
    return { enabled: true, number: toInternational(process.env.SMS_ADMIN_NUMBER || "") };
  }
}

export type SmsResult = { ok: boolean; error?: string };

/**
 * Sends an SMS through the TextBee gateway. Never throws — a failed SMS must not break the request flow.
 * `recipient` defaults to the admin alert number from the admin Settings page.
 */
export async function sendSms(message: string, recipient?: string): Promise<SmsResult> {
  const apiKey = process.env.TEXTBEE_API_KEY;
  if (!apiKey) return { ok: false, error: "TEXTBEE_API_KEY is not configured" };

  let to = "";
  if (recipient) {
    to = toInternational(recipient);
  } else {
    const cfg = await adminSettings();
    if (!cfg.enabled) return { ok: false, error: "SMS alerts are turned off in Settings" };
    to = cfg.number;
  }
  if (!to) {
    console.warn("SMS skipped: no valid recipient number (set it in admin Settings).");
    return { ok: false, error: "No valid recipient number" };
  }

  try {
    const res = await fetch("https://api.textbee.dev/api/v1/gateway/send-sms", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ recipients: [to], message }),
      signal: AbortSignal.timeout(10000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body?.error) {
      const error = String(body?.message || body?.error || `HTTP ${res.status}`);
      console.error("TextBee SMS failed:", res.status, error);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (err: any) {
    console.error("TextBee SMS error:", err);
    return { ok: false, error: err?.message || "Network error" };
  }
}
