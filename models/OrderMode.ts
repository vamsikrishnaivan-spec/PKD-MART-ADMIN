import mongoose, { Schema, Document, Model } from "mongoose";

// ✅ Interface for document
export interface IOrderMode extends Document {
  isQuickActive: boolean;
  isScheduledActive: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Interface for Model (to include getSingleton)
export interface IOrderModeModel extends Model<IOrderMode> {
  getSingleton(): Promise<IOrderMode>;
}

// ✅ Schema definition
const OrderModeSchema = new Schema<IOrderMode, IOrderModeModel>(
  {
    isQuickActive: {
      type: Boolean,
      default: true, // Quick mode ON by default
    },
    isScheduledActive: {
      type: Boolean,
      default: true, // Scheduled mode ON by default
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Optional admin reference
    },
  },
  { timestamps: true }
);

// ✅ Static method: singleton pattern
OrderModeSchema.statics.getSingleton = async function (): Promise<IOrderMode> {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// ✅ Export model safely for re-use
const OrderMode =
  (mongoose.models.OrderMode as IOrderModeModel) ||
  mongoose.model<IOrderMode, IOrderModeModel>("OrderMode", OrderModeSchema);

export default OrderMode;
