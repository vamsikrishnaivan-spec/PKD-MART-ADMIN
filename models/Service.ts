import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    imageUrl: { type: String, required: true },
    mobileNumber: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    status: { type: Number, enum: [0, 1], default: 1 },
  },
  { timestamps: true }
);

ServiceSchema.virtual("id").get(function () {
  return this._id.toString();
});

ServiceSchema.set("toJSON", { virtuals: true });
ServiceSchema.set("toObject", { virtuals: true });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
