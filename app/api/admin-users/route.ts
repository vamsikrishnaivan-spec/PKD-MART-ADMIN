import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import AdminUser from "@/models/AdminUser"
import bcrypt from "bcrypt"

export async function GET() {
  try {
    await getDatabase()
    const users = await AdminUser.find().select("-password") // hide passwords
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await getDatabase()
    const body = await req.json()
    const { name, email, password, role } = body

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check existing user
    const existing = await AdminUser.findOne({ email })
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    

    const user = new AdminUser({
      name,
      email,
      password,
      role: role || "merchant",
    })

    await user.save()

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
