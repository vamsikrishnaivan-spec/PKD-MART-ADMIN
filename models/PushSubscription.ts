import mongoose, { Schema, models } from "mongoose"

const pushSubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },

    // optional but useful for debugging / analytics
    browser: { type: String },
    device: { type: String },

    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default models.PushSubscription ||
  mongoose.model("PushSubscription", pushSubscriptionSchema)
