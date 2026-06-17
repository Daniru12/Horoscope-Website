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

    const { resultText, resultImageUrls, resultPdfUrl } = await req.json();

    const request = await ServiceRequest.findById(id);
    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    request.resultText = resultText;
    request.resultImageUrls = resultImageUrls || [];
    if (resultPdfUrl) request.resultPdfUrl = resultPdfUrl;
    request.status = 'completed'; // Admin marking it as completed by uploading result

    await request.save();

    return NextResponse.json({ message: "Result uploaded successfully", request }, { status: 200 });
  } catch (error) {
    console.error("Upload result error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
