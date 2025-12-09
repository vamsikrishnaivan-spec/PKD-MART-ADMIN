import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getDatabase as connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// ✅ POST /api/orders/[id]/cancel
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
        }

        // Find the order
        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check if order is already delivered
        if (order.deliveryStatus === "DELIVERED") {
            return NextResponse.json(
                { error: "Cannot cancel a delivered order" },
                { status: 400 }
            );
        }

        // Check if order is already cancelled
        if (order.deliveryStatus === "CANCELLED") {
            return NextResponse.json(
                { error: "Order is already cancelled" },
                { status: 400 }
            );
        }

        // Update delivery status to CANCELLED
        order.deliveryStatus = "CANCELLED";
        await order.save();

        return NextResponse.json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        console.error("Error cancelling order:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
