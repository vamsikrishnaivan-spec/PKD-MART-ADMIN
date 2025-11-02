import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { getDatabase as connectDB } from "@/lib/mongodb"
import User from "@/models/User"

// GET - Get user by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update user by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params
    const body = await request.json()
    const { email, cart } = body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check for duplicate email in another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { email, cart: cart || [] },
      { new: true },
    )

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete user by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const deletedUser = await User.findByIdAndDelete(id)

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
