import { NextRequest, NextResponse } from "next/server";
import { getDatabase as connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, slug, category, description, price, imageUrl, status } = body;

    if (!name || !slug || !category || price === undefined || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingService = await Service.findOne({ slug });
    if (existingService) {
      return NextResponse.json({ error: "Service with this slug already exists" }, { status: 409 });
    }

    const newService = await Service.create({
      name,
      slug,
      category,
      description: description || "",
      price: Number(price),
      imageUrl,
      status: status !== undefined ? status : 1,
    });

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    await import("@/models/Service"); 
    const services = await Service.find().sort({ createdAt: -1 });
    return NextResponse.json(services);
  } catch (error) {
    console.error("❌ Error fetching services:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
