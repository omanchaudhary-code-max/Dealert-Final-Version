import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'

const PUBLIC_ROUTES = ['/', '/deals', '/deal', '/fake-page-detector', '/price-index']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/verify-email']
const ADMIN_ROUTES = ['/admin']
const PROTECTED_ROUTES = ['/dashboard']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_ROUTES.some(r => pathname === r)
  if (isPublic) {
    return NextResponse.next()
  }
  const isAuth = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isAdmin = ADMIN_ROUTES.some(r => pathname.startsWith(r))
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  const accessToken = request.cookies.get('access_token')?.value

  let payload: { userId: string; role: string } | null = null
  if (accessToken) {
    try {
      payload = await verifyAccessToken(accessToken)
    } catch {
      payload = null
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuth && payload) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect dashboard
  if (isProtected && !payload) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect admin
  if (isAdmin) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
