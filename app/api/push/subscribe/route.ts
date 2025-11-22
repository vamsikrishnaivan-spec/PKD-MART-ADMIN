import { NextResponse } from "next/server"
import PushSubscription from "@/models/PushSubscription"
import { getDatabase as connectDB } from "@/lib/mongodb"

export async function POST(req: Request) {
  await connectDB()

  const { userId, subscription, browser, device } = await req.json()

  if (!subscription || !subscription.endpoint) {
    return NextResponse.json({ success: false, error: "Invalid subscription" }, { status: 400 })
  }

  // Prevent duplicates for same user
  const exists = await PushSubscription.findOne({
    userId,
    endpoint: subscription.endpoint
  })

  if (!exists) {
    await PushSubscription.create({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      browser,
      device,
    })
  }

  return NextResponse.json({ success: true })
}
