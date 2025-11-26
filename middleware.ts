import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    "/((?!login|api/auth|api/notifications/push-all|manifest.json|sw.js|icons/|_next/).*)",
  ],
}

