import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, price, imageUrl, category } = body

    if (!productName || !price || !imageUrl || !category) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (price <= 0) {
      return NextResponse.json({ error: "Price must be greater than 0" }, { status: 400 })
    }

    const validCategories = ["vegetables", "fruits", "dairy", "essentials", "snacks", "instant-food"]
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const db = await getDatabase()

    const result = await db.collection("products").insertOne({
      productName,
      price: Number.parseFloat(price),
      imageUrl,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        success: true,
        productId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
