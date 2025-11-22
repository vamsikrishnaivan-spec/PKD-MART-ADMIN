import { NextResponse } from "next/server"
import PushSubscription from "@/models/PushSubscription"
import { getDatabase as connectDB } from "@/lib/mongodb"

export async function POST(req: Request) {
  await connectDB()

  const { userId, subscription, browser, device } = await req.json()

  // Prevent duplicates
  const exists = await PushSubscription.findOne({
    endpoint: subscription.endpoint,
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
