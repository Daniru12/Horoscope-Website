import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import User from "@/models/User";
import Service from "@/models/Service";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const requests = await ServiceRequest.find()
      .populate('user', 'name email image')
      .populate('service')
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("Admin fetch requests error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
