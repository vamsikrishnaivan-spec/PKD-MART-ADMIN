"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import ConfirmDeliveryButton from "@/components/ConfirmDeliveryButton"
import { Badge } from "@/components/ui/badge"
import { getDatabase } from "@/lib/mongodb"
import type { Order } from "@/lib/types"
import { ArrowLeft, User, MapPin, CreditCard, Package, Truck, ExternalLink, Phone } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export async function fetchOrderById(id: string) {
  try {
    // ✅ Use backticks for template literal
    const res = await fetch(`/api/orders/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch order: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
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

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
      </div>
    )
  }

  if (isError || !order) {
    return <p className="p-6 text-red-500">Failed to load order.</p>
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <SidebarTrigger className="md:hidden self-start" />
        <Button variant="outline" size="sm" asChild className="w-fit bg-transparent">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order #{order.transactionId.slice(-8)}</span>
                <Badge
                  className={
                    order.paymentMethod === "cod"
                      ? statusColors[order.paymentStatus as keyof typeof statusColors] // use paymentStatus color
                      : statusColors[order.status as keyof typeof statusColors] // use order status color
                  }
                >
                  {order.paymentMethod === "cod" ? order.paymentStatus : order.status}
                </Badge>

              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold">₹{order.totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment Method</div>
                  <Badge variant="outline" className="mt-1">
                    <CreditCard className="h-3 w-3 mr-1" />
                    {order.paymentMethod}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery Status</div>
                  <Badge className={`${deliveryStatusColors[order.deliveryStatus as keyof typeof deliveryStatusColors]} mt-1`}>
                    <Truck className="h-3 w-3 mr-1" />
                    {order.deliveryStatus}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery Type</div>
                  <Badge className={`bg-blue-100 text-blue-800 mt-1`}>
                    <Truck className="h-3 w-3 mr-1" />
                    {order.orderType}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Delivery Time Slot</div>
                  <Badge className={`bg-blue-100 text-blue-800 mt-1`}>
                    <Truck className="h-3 w-3 mr-1" />
                    {order.deliverySlot}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Order Date</div>
                  <div className="font-medium">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Image
                      src={item.productId?.imageUrl || "/placeholder.svg?height=60&width=60"}
                      alt={item.productId?.productName || "Product"}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {item.productId?.name || `Product ${item.productId}`}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        ₹{item.productId?.sellingPrice?.toFixed(2) || "0.00"} × {item.quantity}
                      </div>
                      {item.productId?.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {item.productId.category}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ₹{((item.productId?.sellingPrice || 0) * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                  </div>
                )) || <div className="text-center py-8 text-muted-foreground">No items in this order</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium">{(order as any).userDetails?.email || order.user}</div>
                <div className="text-sm text-muted-foreground">User ID: {order.user}</div>
                <div className="text-sm text-muted-foreground">User Name: {order.name}</div>
                <div className="text-sm text-muted-foreground d-flex align-items-center gap-2">
                  User Mobile: {order.mobile}
                  <a
                    href={`tel:${order.mobile}`}
                    className="ms-3 inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.deliveryAddress?.label && (
                  <div className="font-medium text-lg">{order.deliveryAddress.label}</div>
                )}

                <div className="text-sm text-muted-foreground space-y-1">
                  {order.deliveryAddress?.street && <div>{order.deliveryAddress.street}</div>}
                  <div>
                    {order.deliveryAddress?.city && `${order.deliveryAddress.city}, `}
                    {order.deliveryAddress?.state && `${order.deliveryAddress.state} `}
                    {order.deliveryAddress?.pincode}
                  </div>
                  {order.deliveryAddress?.country && <div>{order.deliveryAddress.country}</div>}
                </div>

                {order.deliveryAddress?.formattedAddress && (
                  <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg border">
                    <div className="font-medium mb-1">Full Address:</div>
                    {order.deliveryAddress.formattedAddress}
                  </div>
                )}

                {order.deliveryAddress?.lat && order.deliveryAddress?.lng && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Coordinates: {order.deliveryAddress.lat}, {order.deliveryAddress.lng}
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <a
                        href={`https://www.google.com/maps?q=${order.deliveryAddress.lat},${order.deliveryAddress.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        View on Google Maps
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/orders/${order._id}/edit`}>Edit Order</Link>
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Print Order
              </Button>
              <ConfirmDeliveryButton
                orderId={order._id}
                deliveryStatus={order.deliveryStatus}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
