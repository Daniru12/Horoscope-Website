import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

/** Returns a NextResponse to send back if the caller is not an admin, otherwise null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const user = await User.findById(session.user.id).select("role");
  if (!user || user.role !== "admin") return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
  return null;
}
