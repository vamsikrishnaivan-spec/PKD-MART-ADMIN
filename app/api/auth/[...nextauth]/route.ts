import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getDatabase } from "@/lib/mongodb"
import AdminUser from "@/models/AdminUser"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        await getDatabase()
        const user = await AdminUser.findOne({ email: credentials.email })

        if (!user) throw new Error("User not found")
        if (!user.isActive) throw new Error("User inactive")
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) throw new Error("Invalid credentials")

        user.lastLogin = new Date()
        await user.save()

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
