import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { paymentReceiptUrl } = await req.json();

    if (!paymentReceiptUrl) {
      return NextResponse.json({ message: "Missing payment receipt URL" }, { status: 400 });
    }

    await connectToDatabase();

    const request = await ServiceRequest.findOne({ _id: id, user: session.user.id });
    if (!request) {
      return NextResponse.json({ message: "Request not found or unauthorized" }, { status: 404 });
    }

    request.paymentReceiptUrl = paymentReceiptUrl;
    request.paymentStatus = 'uploaded';
    
    await request.save();

    return NextResponse.json({ message: "Payment receipt uploaded successfully", request }, { status: 200 });
  } catch (error) {
    console.error("Upload payment receipt error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
