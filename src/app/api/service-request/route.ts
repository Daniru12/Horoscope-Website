import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { birthDate, birthTime, birthPlace, horoscopeImageUrl, serviceId, serviceName } = await req.json();

    if (!birthDate || !birthTime || !birthPlace) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const request = await ServiceRequest.create({
      user: session.user.id,
      birthDate,
      birthTime,
      birthPlace,
      horoscopeImageUrl,
      service: serviceId || undefined,
      serviceName: serviceName || "ජ්‍යෝතිෂ්‍ය කියවීම",
      status: "pending",
    });

    // --- Twilio WhatsApp Notification ---
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
    const WHATSAPP_ADMIN_NUMBER = process.env.WHATSAPP_ADMIN_NUMBER;

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const requestLink = `${appUrl}/admin`;

        // Using Twilio Content API as requested
        await client.messages.create({
          from: TWILIO_WHATSAPP_NUMBER,
          contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
          contentVariables: JSON.stringify({
            "1": request.serviceName,
            "2": `${session.user.name || session.user.email || "User"} (Link: ${requestLink})`
          }),
          to: WHATSAPP_ADMIN_NUMBER
        });
        
        console.log("Twilio WhatsApp notification sent via Content API");
      } catch (waError) {
        console.error("Twilio WhatsApp notification failed:", waError);
      }
    }
    // ------------------------------------

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
