import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    /*
      Protect everything except:
      - the login page
      - NextAuth API routes
      - static files (_next, favicon, etc.)
    */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
