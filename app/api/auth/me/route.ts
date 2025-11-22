import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AdminUser from "@/models/AdminUser"
import { getDatabase as connectDB } from "@/lib/mongodb"

export async function GET() {
  await connectDB()

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return Response.json({ user: null })
  }

  const user = await AdminUser.findOne({ email: session.user.email }).lean()

  return Response.json({ user })
}
