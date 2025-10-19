import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, items, totalAmount, status, transactionId, paymentMethod, deliveryStatus, deliveryAddress, orderType="Scheduled", deliverySlot=null   } = body

    // Validation
    if (!user || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "User and items are required" }, { status: 400 })
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: "Valid total amount is required" }, { status: 400 })
    }

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(user)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !ObjectId.isValid(item.productId)) {
        return NextResponse.json({ error: "Invalid product ID in items" }, { status: 400 })
      }
      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: "Invalid quantity in items" }, { status: 400 })
      }
    }

    const db = await getDatabase()

    // Check if user exists
    const userExists = await db.collection("users").findOne({ _id: new ObjectId(user) })
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    // Check if all products exist
    const productIds = items.map((item: any) => new ObjectId(item.productId))
    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
    if (products.length !== items.length) {
      return NextResponse.json({ error: "Some products not found" }, { status: 400 })
    }

    // Convert items to proper format
    const orderItems = items.map((item: any) => ({
      productId: new ObjectId(item.productId),
      quantity: Number.parseInt(item.quantity),
    }))
    const isQuick = orderType === "Quick";

    const result = await db.collection("orders").insertOne({
      user: new ObjectId(user),
      items: orderItems,
      totalAmount: Number.parseFloat(totalAmount),
      status: status || "PENDING",
      transactionId,
      paymentMethod: paymentMethod || "PhonePe",
      deliveryStatus: deliveryStatus || "PROCESSING",
      deliveryAddress,
      orderType: isQuick ? "Quick" : "Scheduled",
      deliverySlot: isQuick ? null : deliverySlot || "6–8 AM", // null if quick
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        success: true,
        orderId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()

    // Fetch orders
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray()

    if (orders.length === 0) return NextResponse.json([], { status: 200 })

    // Collect all unique product IDs
    const productIds = orders
      .flatMap(order => order.items.map((item: any) => item.productId))
      .map((id: any) => new ObjectId(id))

    // Fetch products
    const products = await db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()

    // Map products by ID for easy lookup
    const productMap = new Map(products.map(p => [p._id.toString(), p]))

    // Merge product details into order items
    const populatedOrders = orders.map(order => ({
      ...order,
      items: order.items.map((item: any) => {
        const product = productMap.get(item.productId.toString())
        return {
          ...item,
          name: product?.name || "Unknown Product",
          price: product?.sellingPrice || 0,
          image: product?.imageUrl || ""
        }
      }),
    }))

    return NextResponse.json(populatedOrders, { status: 200 })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

