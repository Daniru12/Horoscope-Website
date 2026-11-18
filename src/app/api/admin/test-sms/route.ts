import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { sendSms, toInternational } from "@/lib/sms";

/** Sends a test SMS so the admin can confirm the gateway and number work. Optional body: { number } */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { number } = await req.json().catch(() => ({}));
  if (number && !toInternational(number)) {
    return NextResponse.json({ message: "Invalid phone number" }, { status: 400 });
  }

  const result = await sendSms("[TEST] SMS alerts are working. You will get a message for each new request and payment.", number || undefined);
  if (!result.ok) return NextResponse.json({ message: result.error || "SMS failed" }, { status: 502 });
  return NextResponse.json({ message: "Test SMS sent" });
}
