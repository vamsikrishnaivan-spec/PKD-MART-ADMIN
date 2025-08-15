"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, User, CreditCard, Truck, Package, ShoppingCart } from "lucide-react"
import Link from "next/link"
import type { Order } from "@/lib/types"

interface OrdersListProps {
  orders: Order[]
  isLoading: boolean
  error: any
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
}

const deliveryStatusColors = {
  PROCESSING: "bg-blue-100 text-blue-800",
  DISPATCHED: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-green-100 text-green-800",
}

export function OrdersList({ orders, isLoading, error }: OrdersListProps) {
  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Failed to load orders. Please try again.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="block md:hidden space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border border-gray-100">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Loading */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="font-semibold text-gray-700">Order ID</TableHead>
                <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                <TableHead className="font-semibold text-gray-700">Items</TableHead>
                <TableHead className="font-semibold text-gray-700">Total</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Payment</TableHead>
                <TableHead className="font-semibold text-gray-700">Delivery</TableHead>
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-100">
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No orders found</p>
        <p className="text-sm">Orders will appear here when customers place them</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden space-y-3 p-4">
        {orders.map((order) => (
          <Card key={order._id?.toString()} className="border border-gray-100 hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono text-sm font-medium text-gray-900">#{order.transactionId?.slice(-8)}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <User className="h-3 w-3" />
                    {(order as any).userDetails?.email || order.user}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</div>
                  <Badge className={`${statusColors[order.status]} text-xs mt-1`}>{order.status}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>{order.items?.length || 0} items</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  <Badge variant="outline" className="text-xs border-gray-200">
                    {order.paymentMethod}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <Badge className={`${deliveryStatusColors[order.deliveryStatus]} text-xs`}>
                    {order.deliveryStatus}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Link href={`/orders/${order._id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700">Order ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Customer</TableHead>
              <TableHead className="font-semibold text-gray-700">Items</TableHead>
              <TableHead className="font-semibold text-gray-700">Total</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Payment</TableHead>
              <TableHead className="font-semibold text-gray-700">Delivery</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id?.toString()} className="border-gray-100 hover:bg-gray-50/50">
                <TableCell className="font-mono text-sm">#{order.transactionId?.slice(-8)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{(order as any).userDetails?.email || order.user}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Package className="h-3 w-3 mr-1" />
                    {order.items?.length || 0} items
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-gray-900">₹{order.totalAmount?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-gray-200">
                    <CreditCard className="h-3 w-3 mr-1" />
                    {order.paymentMethod}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={deliveryStatusColors[order.deliveryStatus]}>
                    <Truck className="h-3 w-3 mr-1" />
                    {order.deliveryStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                  >
                    <Link href={`/orders/${order._id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
