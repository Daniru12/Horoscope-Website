import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import User from "@/models/User";
import { normalizePhone } from "@/lib/phone";
import { sendSms } from "@/lib/sms";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { birthDate, birthTime, birthPlace, horoscopeImageUrl, serviceId, serviceName, contactNumber, note } = await req.json();

    if (!birthDate || !birthTime || !birthPlace) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const phone = normalizePhone(contactNumber);
    if (!phone) {
      return NextResponse.json({ message: "Valid contact number is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Remember the number on the profile so the next request is pre-filled.
    await User.findByIdAndUpdate(session.user.id, { phone });

    const request = await ServiceRequest.create({
      user: session.user.id,
      birthDate,
      birthTime,
      birthPlace,
      contactNumber: phone,
      note: typeof note === "string" ? note.trim().slice(0, 500) || undefined : undefined,
      horoscopeImageUrl,
      service: serviceId || undefined,
      serviceName: serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම",
      status: "pending",
    });

    // --- SMS alert to admin (TextBee) ---
    await sendSms(
      `[NEW SERVICE REQUEST]\nName: ${session.user.name || session.user.email || "User"}\nMobile: ${phone}\nService: ${request.serviceName}\nBirth: ${birthDate} ${birthTime}, ${birthPlace}`
    );

    return NextResponse.json({ message: "Service request created", request }, { status: 201 });
  } catch (error) {
    console.error("Service request error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const requests = await ServiceRequest.find({ user: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("Service request fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
