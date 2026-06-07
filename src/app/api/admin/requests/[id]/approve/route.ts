import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import User from "@/models/User";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const request = await ServiceRequest.findById(id);
    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    request.paymentStatus = 'approved';
    await request.save();

    return NextResponse.json({ message: "Payment approved successfully", request }, { status: 200 });
  } catch (error) {
    console.error("Approve payment error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
