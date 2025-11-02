import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {getDatabase as connectDB} from "@/lib/mongodb"
import Order from "@/models/Order"; // your Mongoose Order model

// ✅ DELETE /api/orders/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const result = await Order.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await Order.findById(id).populate({
      path: "items.productId",
      select: "name sellingPrice imageUrl category",
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ PUT /api/orders/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const {
      user,
      items,
      totalAmount,
      status,
      paymentMethod,
      deliveryStatus,
      deliveryAddress,
    } = body;

    const updateData: any = { updatedAt: new Date() };

    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
      }
      updateData.user = user;
    }

    if (items && Array.isArray(items)) {
      updateData.items = items.map((item: any) => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        quantity: Number(item.quantity),
      }));
    }

    if (totalAmount !== undefined) updateData.totalAmount = Number(totalAmount);
    if (status) updateData.status = status;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (deliveryStatus) {
      updateData.deliveryStatus = deliveryStatus;
      if (deliveryStatus.toLowerCase() === "delivered") {
        updateData.paymentStatus = "PAID";
      }
    }
    if (deliveryAddress) updateData.deliveryAddress = deliveryAddress;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ POST /api/orders/[id]/verify-otp
// (optional proxy for verifying OTP on external API)
export async function POST(req: NextRequest) {
  try {
    const { orderId, otp } = await req.json();

    const res = await fetch(`https://pkdmart.com/api/order/${orderId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, otp }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
