import { NextRequest, NextResponse } from "next/server"
import {getDatabase as connectDB} from "@/lib/mongodb"
import Order from "@/models/Order"
import User from "@/models/User"
import Product from "@/models/Product"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { user, items, totalAmount, status, transactionId, paymentMethod, deliveryStatus, deliveryAddress, orderType = "Scheduled", deliverySlot = null } = body

    // Validation
    if (!user || !mongoose.Types.ObjectId.isValid(user))
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })

    if (!items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ error: "Items required" }, { status: 400 })

    if (!totalAmount || totalAmount <= 0)
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 })

    if (!transactionId)
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })

    const userExists = await User.findById(user)
    if (!userExists)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Validate each product
    const productIds = items.map((i) => i.productId)
    const foundProducts = await Product.find({ _id: { $in: productIds } })
    if (foundProducts.length !== items.length)
      return NextResponse.json({ error: "Some products not found" }, { status: 400 })

    const isQuick = orderType === "Quick"

    const order = await Order.create({
      user,
      items,
      totalAmount,
      status: status || "PENDING",
      transactionId,
      paymentMethod: paymentMethod || "PhonePe",
      deliveryStatus: deliveryStatus || "PROCESSING",
      deliveryAddress,
      orderType: isQuick ? "Quick" : "Scheduled",
      deliverySlot: isQuick ? null : deliverySlot || "6–8 AM",
    })

    return NextResponse.json({ success: true, orderId: order._id }, { status: 201 })
  } catch (err) {
    console.error("Error creating order:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const orders = await Order.find()
      .sort({ createdAt: -1 }).populate({
        path: "items.productId",
        select: "name sellingPrice imageUrl category",
      })

    return NextResponse.json(orders, { status: 200 })
  } catch (err) {
    console.error("Error fetching orders:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
