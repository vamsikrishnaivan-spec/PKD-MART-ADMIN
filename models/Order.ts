import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";
import OrderMode from "./OrderMode"; // ✅ keep your actual path
import CartItem from "./CartItem";   // ✅ if you need it, else remove import
import "@/models/Product"


// ✅ Define TypeScript interfaces

interface IDeliveryAddress {
  street?: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
  label?: string;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
}

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  mobile: string;
  items: IOrderItem[];
  totalAmount: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  transactionId: string;
  paymentMethod: "phonepe" | "cod";
  deliveryStatus: "PROCESSING" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  orderType: "quick" | "scheduled";
  deliverySlot?: string | null;
  deliveryAddress: IDeliveryAddress;
  otp?: string | null;
}

// ✅ Define Delivery Address Schema
const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    street: { type: String, required: false },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    label: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    formattedAddress: { type: String },
  },
  { _id: false }
);

// ✅ Define Order Schema
const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    transactionId: { type: String, required: true, unique: true },
    paymentMethod: {
      type: String,
      enum: ["phonepe", "cod"],
      default: "cod",
    },
    deliveryStatus: {
      type: String,
      enum: ["PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"],
      default: "PROCESSING",
    },
    orderType: {
      type: String,
      enum: ["quick", "scheduled"],
      default: "quick",
    },
    deliverySlot: {
      type: String,
      default: null,
      validate: {
        validator: function (this: IOrder, value: string | null) {
          return this.orderType === "scheduled" ? !!value : true;
        },
        message: "Delivery slot is required for scheduled orders.",
      },
    },
    deliveryAddress: { type: DeliveryAddressSchema, required: true },
    otp: { type: String, default: null },
  },
  { timestamps: true }
);

// ✅ Pre-save hook
OrderSchema.pre<IOrder>("save", async function (next) {
  try {
    const settings = await OrderMode.getSingleton();

    if (this.orderType === "quick" && !settings.isQuickActive) {
      throw new Error("Quick Delivery is currently disabled by admin.");
    }

    if (this.orderType === "scheduled" && !settings.isScheduledActive) {
      throw new Error("Scheduled Delivery is currently disabled by admin.");
    }

    next();
  } catch (err) {
    next(err as any);
  }
});

// ✅ Instance methods



OrderSchema.methods.verifyOtp = async function (
  otp: string
): Promise<{ success: boolean; message: string }> {


  if (this.otp !== otp) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  this.otp = null;
  await this.save();

  return { success: true, message: "OTP verified successfully" };
};

// ✅ Model export (safe for hot reload)
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
