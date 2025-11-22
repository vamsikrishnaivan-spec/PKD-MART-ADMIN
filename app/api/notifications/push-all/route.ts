import { sendPushToAllAdmins } from "@/lib/sendPushAllAdmins"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "").trim()

    if (!token || token !== process.env.ADMIN_PUSH_API_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    const { title, body, url } = await req.json()

    if (!title || !body) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 }
      )
    }

    const payload = {
      title,
      body,
      data: { url: url || "/dashboard" },
    }

    const result = await sendPushToAllAdmins(payload)

    return NextResponse.json({
      success: true,
      message: "Push sent to all admins",
      result,
    })
  } catch (error: any) {
    console.error("Error sending admin push:", error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
