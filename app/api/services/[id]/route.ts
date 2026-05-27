import { NextRequest, NextResponse } from "next/server";
import { getDatabase as connectDB } from "@/lib/mongodb";
import Service from "@/models/Service";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await import("@/models/Service");
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error("❌ Error fetching service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const updatedService = await Service.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, service: updatedService });
  } catch (error) {
    console.error("❌ Error updating service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deletedService = await Service.findByIdAndDelete(params.id);
    
    if (!deletedService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting service:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
