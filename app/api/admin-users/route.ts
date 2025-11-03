import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import AdminUser from "@/models/AdminUser"
import bcrypt from "bcryptjs"

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
    const { name, email, password, role, createdBy } = body
    if (!name || !email || !password || !createdBy) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Verify creator
    const creator = await AdminUser.findOne({ email: createdBy })
    if (!creator || creator.role !== "superadmin") {
      return NextResponse.json(
        { message: "Unauthorized: Only Super Admins can create new users" },
        { status: 403 }
      )
    }
    if(role==="superadmin"){
      return NextResponse.json({ message: "only super admin can create user" }, { status: 400 })
    }

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
