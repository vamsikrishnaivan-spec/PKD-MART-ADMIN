import { NextResponse } from "next/server"
import PushSubscription from "@/models/PushSubscription"
import { getDatabase as connectDB } from "@/lib/mongodb"

export async function POST(req: Request) {
  await connectDB()

  const { endpoint } = await req.json()

  await PushSubscription.findOneAndDelete({ endpoint })

  return NextResponse.json({ success: true })
}
