import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const currentUser = await User.findById(session.user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
