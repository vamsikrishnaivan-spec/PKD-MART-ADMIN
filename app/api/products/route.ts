import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
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
      currency,
      imageUrl,
    } = body

    // ✅ Validate required fields
    if (!upc || !name || !category || !sellingPrice || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // ✅ Price validation
    if (sellingPrice <= 0) {
      return NextResponse.json({ error: "Selling price must be greater than 0" }, { status: 400 })
    }

    const db = await getDatabase()

    const product = {
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
      currency,
      imageUrl: imageUrl || "/assets/placeholder.webp",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("products").insertOne(product)

    return NextResponse.json(
      {
        success: true,
        productId: result.insertedId,
        product,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error creating product:", error)
    return NextResponse.json({ error: `Error:-${error}` }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(products)
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
