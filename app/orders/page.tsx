"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { OrdersList } from "@/components/orders-list"
import { OrderFilters } from "@/components/order-filters"
import { ShoppingCart, Clock, CheckCircle, Truck, Shield } from "lucide-react"
import { useState } from "react"

async function fetchOrders(filters: any = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value as string)
  })

  const response = await fetch(`/api/orders?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch orders")
  }
  return response.json()
}

export default function OrdersPage() {
  const [filters, setFilters] = useState({})

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrders(filters),
  })

  const pendingOrders = orders.filter((o: any) => o.status === "PENDING").length
  const paidOrders = orders.filter((o: any) => o.status === "PAID").length
  const processingOrders = orders.filter((o: any) => o.deliveryStatus === "PROCESSING").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-500 mt-1">View and monitor customer orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Shield className="h-3 w-3 mr-1" />
            Read Only
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-6 w-12" /> : orders.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-6 w-12" /> : pendingOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-6 w-12" /> : paidOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-6 w-12" /> : processingOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <OrderFilters onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-900">
            All Orders ({isLoading ? "..." : orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <OrdersList orders={orders} isLoading={isLoading} error={error} />
        </CardContent>
      </Card>
    </div>
  )
}
