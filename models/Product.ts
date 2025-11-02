// lib/models/Product.ts
import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    upc: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String, required: true },
    subcategory: { type: String },
    manufacturer: { type: String },
    model: { type: String, default: null },
    description: { type: String, default: "" },
    mrp: { type: Number, default: null },
    sellingPrice: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
)

// Add `id` virtual
ProductSchema.virtual("id").get(function () {
  return this._id.toString();
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

// Prevent model overwrite during hot reloads
export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
