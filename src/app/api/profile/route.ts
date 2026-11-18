import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

/** Returns the signed-in user's saved contact number so forms can pre-fill it. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const user = await User.findById(session.user.id).select("phone");
  return NextResponse.json({ phone: user?.phone || "" });
}
