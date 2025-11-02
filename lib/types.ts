import type { ObjectId } from "mongodb"

export interface CartItem {
  productId: ObjectId | string
  quantity: number
}

export interface User {
  _id?: ObjectId | string
  email: string
  cart: CartItem[]
  createdAt?: Date
  updatedAt?: Date
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


export interface DeliveryAddress {
  street: string
  city: string
  pincode: string
  state: string
  country: string
  label: string
  lat: number
  lng: number
  formattedAddress: string
}

export interface Order {
  _id: string
  user: string
  name: string
  mobile: string
  items: CartItem[]
  totalAmount: number
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED"
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED"
  transactionId: string
  paymentMethod: "phonepe" | "cod"
  deliveryStatus: "PROCESSING" | "DISPATCHED" | "DELIVERED"
  deliveryAddress: DeliveryAddress
  createdAt?: Date
  updatedAt?: Date
  orderType?: string
  deliverySlot:string
}

export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  processingOrders: number
}
