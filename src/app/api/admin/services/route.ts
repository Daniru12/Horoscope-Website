import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Service from "@/models/Service";
import User from "@/models/User";
import { auth } from "@/auth";

export async function POST(req: Request) {
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

    const { title, description, price, duration, iconName } = await req.json();

    if (!title || !description || !price || !duration) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const service = await Service.create({
      title,
      description,
      price,
      duration,
      iconName: iconName || 'Sparkles'
    });

    return NextResponse.json({ message: "Service created successfully", service }, { status: 201 });
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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

    const { id, title, description, price, duration, iconName } = await req.json();

    if (!id || !title || !description || !price || !duration) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        duration,
        iconName: iconName || 'Sparkles'
      },
      { new: true }
    );

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service updated successfully", service }, { status: 200 });
  } catch (error) {
    console.error("Update service error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
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

    const { id, isActive } = await req.json();

    if (!id || isActive === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!service) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service status updated", service }, { status: 200 });
  } catch (error) {
    console.error("Patch service error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
