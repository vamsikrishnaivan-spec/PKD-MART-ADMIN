import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import {getDatabase as connectDB} from "@/lib/mongodb"
import Product from "@/models/Product"

// ✅ DELETE — remove product by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const deleted = await Product.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("❌ Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ GET — fetch single product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("❌ Error fetching product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ✅ PUT — update product by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const {
      name,
      sellingPrice,
      imageUrl,
      category,
      model,
      description,
      subcategory,
      brand,
      manufacturer,
      mrp,
    } = body

    // ✅ Validate essential fields
    if (!name || !sellingPrice || !imageUrl || !category) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    if (sellingPrice <= 0) {
      return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 })
    }

    const validCategories = ["vegetables", "fruits", "dairy", "essentials", "snacks", "instant-food"]
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          sellingPrice: Number(sellingPrice),
          imageUrl,
          category,
          updatedAt: new Date(),
          model: model || "",
          description: description || "",
          subcategory: subcategory || "",
          brand: brand || "",
          manufacturer: manufacturer || "",
          mrp: mrp ? Number(mrp) : null,
        },
      },
      { new: true }
    )

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error("❌ Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
