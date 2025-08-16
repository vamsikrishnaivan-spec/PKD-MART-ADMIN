import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = await getDatabase()

    const [totalUsers, totalProducts, totalOrders, pendingOrders, paidOrders, processingOrders] = await Promise.all([
      db
        .collection("users")
        .countDocuments()
        .catch(() => 0),
      db
        .collection("products")
        .countDocuments()
        .catch(() => 0),
      db
        .collection("orders")
        .countDocuments()
        .catch(() => 0),
      db
        .collection("orders")
        .countDocuments({ status: "PENDING" })
        .catch(() => 0),
      db
        .collection("orders")
        .countDocuments({ status: "PAID" })
        .catch(() => 0),
      db
        .collection("orders")
        .countDocuments({ deliveryStatus: "PROCESSING" })
        .catch(() => 0),
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
    console.error("Error fetching dashboard stats:", error)

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
