import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const { user, items, totalAmount, status, paymentMethod, deliveryStatus, deliveryAddress } = body

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (user) {
      if (!ObjectId.isValid(user)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
      }
      updateData.user = new ObjectId(user)
    }

    if (items) {
      if (!Array.isArray(items)) {
        return NextResponse.json({ error: "Items must be an array" }, { status: 400 })
      }
      updateData.items = items.map((item: any) => ({
        productId: new ObjectId(item.productId),
        quantity: Number.parseInt(item.quantity),
      }))
    }

    if (totalAmount !== undefined) {
      updateData.totalAmount = Number.parseFloat(totalAmount)
    }

    if (status) updateData.status = status
    if (paymentMethod) updateData.paymentMethod = paymentMethod
    if (deliveryStatus) {
      updateData.deliveryStatus = deliveryStatus

      // If delivered → mark payment as paid
      if (deliveryStatus.toLowerCase() === "delivered") {
        updateData.paymentStatus = "PAID"
      }
    }
    if (deliveryAddress) updateData.deliveryAddress = deliveryAddress

    const db = await getDatabase()

    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

