import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { getDatabase as connectDB } from "@/lib/mongodb"
import Product from "@/models/Product"

export async function POST(request: NextRequest) {
  try {
    await connectDB() // ✅ Ensure DB connection before using Mongoose

    const body = await request.json()
    const {
      upc,
      name,
      brand,
      category,
      subcategory,
      manufacturer,
      model,
      description,
      mrp,
      sellingPrice,
      costPrice,
      currency,
      imageUrl,
    } = body

    // ✅ Validate required fields
    if (!upc || !name || !category || !sellingPrice || !currency) {
      return NextResponse.json({ error: "Missing required fields", message: "Missing required fields"}, { status: 400 })
    }

    // ✅ Price validation
    if (sellingPrice <= 0 || costPrice <= 0) {
      return NextResponse.json({ error: "Selling or cost price must be greater than 0", message: "Selling or cost price must be greater than 0"}, { status: 400 })
    }

    // ✅ Check for duplicate UPC
    const existingProduct = await Product.findOne({ upc })
    if (existingProduct) {
      return NextResponse.json({ error: "Product with this UPC already exists", message: "Product with this UPC already exists"}, { status: 409 })
    }

    // ✅ Create new product
    const newProduct = await Product.create({
      upc,
      name,
      brand: brand || "",
      category,
      subcategory: subcategory || "",
      manufacturer: manufacturer || "",
      model: model || "",
      description: description || "",
      mrp: mrp ? Number(mrp) : null,
      sellingPrice: Number(sellingPrice),
      costPrice: costPrice ? Number(costPrice) : null,
      currency,
      imageUrl: imageUrl || "/assets/placeholder.webp",
    })

    return NextResponse.json(
      {
        success: true,
        productId: newProduct._id,
        product: newProduct,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("❌ Error creating product:", error)
    return NextResponse.json({ error: `Error: ${error}`, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    await import("@/models/Product") // ✅ ensure model is loaded
    const products = await Product.find().sort({ createdAt: -1 })
    return NextResponse.json(products)
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
