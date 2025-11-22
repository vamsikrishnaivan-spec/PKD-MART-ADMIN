import webpush from "web-push"
import PushSubscription from "@/models/PushSubscription"
import AdminUser from "@/models/AdminUser"
import { getDatabase as connectDB } from "@/lib/mongodb"

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushToAllAdmins(payload: any) {
  await connectDB()

  // get admin & superadmin user IDs
  const adminUsers = await AdminUser.find({
    role: { $in: ["admin", "superadmin"] },
    isActive: true,
  }).select("_id")

  const adminIds = adminUsers.map((u) => u._id)

  // fetch all subscriptions for these users
  const subscriptions = await PushSubscription.find({
    userId: { $in: adminIds },
  })

  let sent = 0
  let failed = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        JSON.stringify(payload)
      )
      sent++
    } catch (err: any) {
      failed++

      // remove expired subscriptions (HTTP 410 Gone)
      if (err.statusCode === 410 || err.statusCode === 404) {
        await PushSubscription.deleteOne({ _id: sub._id })
      }
    }
  }

  return { sent, failed, total: subscriptions.length }
}
