import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((session as any).user.role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.redirect(new URL("/profile", req.url));
}
