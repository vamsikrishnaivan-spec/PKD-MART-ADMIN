"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Plus, Minus, Trash2 } from "lucide-react"

interface User {
  _id: string
  email: string
}
export interface Product {
  _id: string
  upc: string
  name: string
  brand: string
  category: string
  subcategory: string
  manufacturer: string
  model: string | null
  description: string
  mrp: number | null
  sellingPrice: number
  currency: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}


interface OrderItem {
  productId: string
  quantity: number
}

export function OrderForm() {
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    user: "",
    items: [] as OrderItem[],
    status: "PENDING",
    paymentMethod: "PhonePe",
    deliveryStatus: "PROCESSING",
    deliveryAddress: {
      street: "",
      city: "",
      pincode: "",
      state: "",
      country: "",
      label: "",
      lat: 0,
      lng: 0,
      formattedAddress: "",
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Fetch users and products
    const fetchData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([fetch("/api/users"), fetch("/api/products")])

        if (usersRes.ok && productsRes.ok) {
          const usersData = await usersRes.json()
          const productsData = await productsRes.json()
          setUsers(usersData)
          setProducts(productsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1 }],
    }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const product = products.find((p) => p._id === item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const totalAmount = calculateTotal()
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`

      const orderData = {
        ...formData,
        totalAmount,
        transactionId,
        deliveryAddress: {
          ...formData.deliveryAddress,
          formattedAddress: `${formData.deliveryAddress.street}, ${formData.deliveryAddress.city}, ${formData.deliveryAddress.state} ${formData.deliveryAddress.pincode}, ${formData.deliveryAddress.country}`,
        },
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order created successfully",
        })
        router.push("/orders")
      } else {
        throw new Error(data.error || "Failed to create order")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="user">Select Customer</Label>
            <Select value={formData.user} onValueChange={(value) => setFormData((prev) => ({ ...prev, user: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Items
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
              <div className="flex-1">
                <Label>Product</Label>
                <Select value={item.productId} onValueChange={(value) => updateItem(index, "productId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.productName} - ₹{product.sellingPrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Label>Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateItem(index, "quantity", Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateItem(index, "quantity", item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="w-20 text-right">
                <Label>Total</Label>
                <div className="font-medium">
                  ₹{((products.find((p) => p._id === item.productId)?.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => removeItem(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {formData.items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No items added. Click "Add Item" to start building the order.
            </div>
          )}

          {formData.items.length > 0 && (
            <div className="text-right pt-4 border-t">
              <div className="text-lg font-bold">Total: ₹{calculateTotal().toFixed(2)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Payment Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value as any }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PhonePe">PhonePe</SelectItem>
                <SelectItem value="COD">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Delivery Status</Label>
            <Select
              value={formData.deliveryStatus}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, deliveryStatus: value as any }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="DISPATCHED">Dispatched</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="label">Address Label</Label>
            <Input
              id="label"
              value={formData.deliveryAddress.label}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryAddress: { ...prev.deliveryAddress, label: e.target.value },
                }))
              }
              placeholder="Home, Office, etc."
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.deliveryAddress.street}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryAddress: { ...prev.deliveryAddress, street: e.target.value },
                }))
              }
              placeholder="Street address"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.deliveryAddress.city}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryAddress: { ...prev.deliveryAddress, city: e.target.value },
                }))
              }
              placeholder="City"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.deliveryAddress.state}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryAddress: { ...prev.deliveryAddress, state: e.target.value },
                }))
              }
              placeholder="State"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={formData.deliveryAddress.pincode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryAddress: { ...prev.deliveryAddress, pincode: e.target.value },
                }))
              }
              placeholder="Pincode"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.deliveryAddress.country}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryAddress: { ...prev.deliveryAddress, country: e.target.value },
                }))
              }
              placeholder="Country"
              required
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isLoading || formData.items.length === 0 || !formData.user}
        className="w-full sm:w-auto"
      >
        {isLoading ? "Creating Order..." : "Create Order"}
      </Button>
    </form>
  )
}
