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

    const { birthDate, birthTime, birthPlace, horoscopeImageUrl } = await req.json();

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
      status: "pending",
    });

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
