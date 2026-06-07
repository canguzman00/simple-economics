import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const isAuth = !!token
  const isAuthPage = req.nextUrl.pathname.startsWith('/signin') || 
                     req.nextUrl.pathname.startsWith('/signup')

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/feed', req.url))
    }
    return NextResponse.next()
  }

  if (!isAuth) {
    const signInUrl = new URL('/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

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
    '/signin',
    '/signup',
  ],
}
