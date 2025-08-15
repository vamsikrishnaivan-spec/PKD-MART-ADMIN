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
  _id?: ObjectId | string
  productName: string
  price: number
  imageUrl: string
  category: "vegetables" | "fruits" | "dairy" | "essentials" | "snacks" | "instant-food"
  createdAt?: Date
  updatedAt?: Date
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
  _id?: ObjectId | string
  user: ObjectId | string
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
}

export interface DashboardStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  processingOrders: number
}
