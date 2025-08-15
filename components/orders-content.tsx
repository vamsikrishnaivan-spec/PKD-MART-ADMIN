import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { getDatabase } from "@/lib/mongodb"
import type { Order } from "@/lib/types"
import { Plus } from "lucide-react"
import Link from "next/link"
import { OrdersList } from "@/components/orders-list"
import { OrderFilters } from "@/components/order-filters"
import { ObjectId } from "mongodb"

async function getOrdersWithDetails(searchParams: any): Promise<Order[]> {
  try {
    const db = await getDatabase()

    // Build filter query
    const filter: any = {}
    if (searchParams.status) {
      filter.status = searchParams.status
    }
    if (searchParams.paymentMethod) {
      filter.paymentMethod = searchParams.paymentMethod
    }
    if (searchParams.deliveryStatus) {
      filter.deliveryStatus = searchParams.deliveryStatus
    }

    // Get orders with populated user and product details
    const orders = await db.collection("orders").find(filter).sort({ createdAt: -1 }).toArray()

    // Get all unique user IDs and product IDs
    const userIds = [...new Set(orders.map((order) => order.user))]
    const productIds = [...new Set(orders.flatMap((order) => order.items?.map((item: any) => item.productId) || []))]

    // Fetch users and products
    const [users, products] = await Promise.all([
      db
        .collection("users")
        .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
        .toArray(),
      db
        .collection("products")
        .find({ _id: { $in: productIds.map((id) => new ObjectId(id)) } })
        .toArray(),
    ])

    // Create lookup maps
    const userMap = new Map(users.map((user) => [user._id.toString(), user]))
    const productMap = new Map(products.map((product) => [product._id.toString(), product]))

    // Populate orders with user and product details
    const populatedOrders = orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      user: order.user.toString(),
      userDetails: userMap.get(order.user.toString()),
      items:
        order.items?.map((item: any) => ({
          ...item,
          productId: item.productId.toString(),
          productDetails: productMap.get(item.productId.toString()),
        })) || [],
    }))

    return populatedOrders as Order[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

interface OrdersContentProps {
  searchParams: {
    status?: string
    paymentMethod?: string
    deliveryStatus?: string
  }
}

export async function OrdersContent({ searchParams }: OrdersContentProps) {
  const orders = await getOrdersWithDetails(searchParams)

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/orders/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Order
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <OrderFilters />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <OrdersList orders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
