import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: function({ token }) {
        return !!token
      },
    },
    pages: {
      signIn: '/signin',
    },
  }
)

export const config = {
  matcher: [
    '/feed/:path*',
    '/ask/:path*',
    '/my-economy/:path*',
    '/company/:path*',
    '/investment-context/:path*',
    '/calculator/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
  ],
}
