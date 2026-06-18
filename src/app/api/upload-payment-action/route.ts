import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";
import connectToDatabase from "@/lib/mongodb";
import ServiceRequest from "@/models/ServiceRequest";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const formData = await req.formData();
    const file = formData.get("paymentReceipt") as File;
    const requestId = formData.get("requestId") as string;

    if (!file || !requestId) {
      return NextResponse.redirect(new URL("/profile?error=missing_file", req.url));
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "horoscope_payments", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const paymentReceiptUrl = (uploadResult as any).secure_url;

    await connectToDatabase();
    
    const request = await ServiceRequest.findOne({ _id: requestId, user: session.user.id });
    if (request) {
      request.paymentReceiptUrl = paymentReceiptUrl;
      request.paymentStatus = 'uploaded';
      await request.save();
    }

    // Redirect back to profile page
    return NextResponse.redirect(new URL("/profile?success=payment_uploaded", req.url), 303);
  } catch (error) {
    console.error("Payment upload error:", error);
    return NextResponse.redirect(new URL("/profile?error=upload_failed", req.url), 303);
  }
}
