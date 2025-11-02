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
  deliveryStatus: "PROCESSING" | "DISPATCHED" | "DELIVERED";
  orderType: "quick" | "scheduled";
  deliverySlot?: string | null;
  deliveryAddress: IDeliveryAddress;
  otpHash?: string | null;

  generateOtp(): Promise<string | null>;
  verifyOtp(otp: string): Promise<{ success: boolean; message: string }>;
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
      enum: ["PROCESSING", "DISPATCHED", "DELIVERED"],
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
    otpHash: { type: String, default: null },
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

OrderSchema.methods.generateOtp = async function (): Promise<string | null> {
  if (this.deliveryStatus === "DELIVERED") return null;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpHash = crypto
    .createHmac("sha256", process.env.OTP_SECRET_KEY || "default_key")
    .update(otp)
    .digest("hex");

  this.otpHash = otpHash;
  await this.save();

  return otp;
};

OrderSchema.methods.verifyOtp = async function (
  otp: string
): Promise<{ success: boolean; message: string }> {
  const otpHash = crypto
    .createHmac("sha256", process.env.OTP_SECRET_KEY || "default_key")
    .update(otp)
    .digest("hex");

  if (this.otpHash !== otpHash) {
    return { success: false, message: "Invalid or expired OTP" };
  }

  this.otpHash = null;
  await this.save();

  return { success: true, message: "OTP verified successfully" };
};

// ✅ Model export (safe for hot reload)
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
