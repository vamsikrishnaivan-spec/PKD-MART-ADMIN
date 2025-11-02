import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: "superadmin" | "admin" | "merchant"
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: "superadmin" | "admin" | "merchant"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "superadmin" | "admin" | "merchant"
  }
}
