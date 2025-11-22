"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import {
  Users,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchOrders } from "../orders/page"
import OrdersMap from "@/components/OrdersMap"
import { OrdersList } from "@/components/orders-list"
import PushSubscribeButton from "@/components/PushSubscribeButton"

async function fetchDashboardStats() {

  const response = await fetch("/api/dashboard/stats", {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  })

  if (!response.ok) {
    console.error("Failed to fetch stats:", response.status, response.statusText)
    throw new Error(`Failed to fetch dashboard stats: ${response.status}`)
  }

  const data = await response.json()

  return data
}

export default function Dashboard() {
  const [filters, setFilters] = useState({})
  const {
    data: stats,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 1000,
  })
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    error: ordersError,
    isError: isOrdersError
  } = useQuery({
    queryKey: ["orders", filters],
    queryFn: () => fetchOrders(filters),
  })


  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      change: "+23%",
      changeType: "positive" as const,
    },
    // {
    //   title: "Pending Orders",
    //   value: stats?.pendingOrders || 0,
    //   icon: Clock,
    //   color: "from-orange-500 to-orange-600",
    //   bgColor: "bg-orange-50",
    //   textColor: "text-orange-700",
    //   change: "-5%",
    //   changeType: "negative" as const,
    // },
    {
      title: "Paid Orders",
      value: stats?.paidOrders || 0,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      change: "+18%",
      changeType: "positive" as const,
    },
    {
      title: "Processing Orders",
      value: stats?.processingOrders || 0,
      icon: Truck,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      change: "+7%",
      changeType: "positive" as const,
    },
  ]
  const pendingOrders= orders.filter((o: any) => o.deliveryStatus === "PROCESSING")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className={`h-4 w-4 ${isError ? "text-red-500" : "text-green-500"}`} />
          <span className="text-sm text-gray-600">{isError ? "Connection error" : "Live updates"}</span>
          {!isError && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>}
        </div>
      </div>

      {/* Error Alert */}
      {isError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Unable to fetch live statistics. Showing cached data. Error: {error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-700 text-xs">
            Debug: Loading={isLoading.toString()}, Error={isError.toString()}, Stats={JSON.stringify(stats)}
          </AlertDescription>
        </Alert>
      )}


<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {statCards.map((stat) => (
    <Card
      key={stat.title}
      className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
    >
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={stat.changeType === "positive" ? "default" : "destructive"}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change}
                </Badge>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  ))}
</div>

      {/* Orders List */}
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-900">
            All Orders ({isOrdersLoading ? "..." : pendingOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <OrdersList orders={pendingOrders} isLoading={isOrdersLoading} error={ordersError} />
        </CardContent>
      </Card>

      <OrdersMap orders={pendingOrders} />

      

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add New Product</p>
                  <p className="text-sm text-gray-500">Create a new product listing</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <div className="p-2 bg-green-50 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Recent Orders</p>
                  <p className="text-sm text-gray-500">Check latest order activity</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connection</span>
              <Badge variant="default" className={isError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                <div className={`h-2 w-2 ${isError ? "bg-red-500" : "bg-green-500"} rounded-full mr-2`}></div>
                {isError ? "Error" : "Connected"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Real-time Updates</span>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <div className="h-2 w-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Sync</span>
              <span className="text-sm text-gray-500">
                {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : "Never"}
              </span>
            </div>
          </CardContent>
        </Card>
        <PushSubscribeButton />
      </div>
    </div>
  )
}
