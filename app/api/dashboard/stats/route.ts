import { NextResponse } from "next/server"
import { getDatabase as connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import Product from "@/models/Product"
import Order from "@/models/Order"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await connectDB()

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      processingOrders,
    ] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Product.countDocuments().catch(() => 0),
      Order.countDocuments().catch(() => 0),
      Order.countDocuments({ deliveryStatus: "PENDING" }).catch(() => 0),
      Order.countDocuments({ deliveryStatus: "DELIVERED" }).catch(() => 0),
      Order.countDocuments({ deliveryStatus: "PROCESSING" }).catch(() => 0),
    ])

    const response = {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      processingOrders,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error)

    return NextResponse.json(
      {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        paidOrders: 0,
        processingOrders: 0,
        lastUpdated: new Date().toISOString(),
        error: "Failed to fetch stats",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
