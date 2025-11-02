import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import User from "@/models/User" // we'll define this below
import { getDatabase as connectDB} from "@/lib/mongodb" // connection helper

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { email, cart = [] } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const user = await User.create({
      email,
      cart,
    })

    return NextResponse.json(
      {
        success: true,
        userId: user._id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Fetch all users
export async function GET() {
  try {
    await connectDB()
    const users = await User.find({}).sort({ createdAt: -1 })
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
