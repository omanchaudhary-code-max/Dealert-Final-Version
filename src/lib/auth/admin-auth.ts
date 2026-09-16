import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/jwt'
import { userRepository } from '@/repositories/user.repository'

export interface AdminAuthResult {
  isAuthorized: boolean
  userId?: string
  role?: string
  errorResponse?: NextResponse
}

/**
 * Server-side Access Control Guard for Admin Routes.
 * Checks JWT access token from cookies or Authorization header.
 * Rejects unauthenticated or non-admin requests with HTTP 403 Forbidden.
 */
export async function requireAdminServerSession(request: NextRequest): Promise<AdminAuthResult> {
  const token =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { error: 'Forbidden. Admin authorization required.' },
        { status: 403 }
      ),
    }
  }

  try {
    const payload = await verifyAccessToken(token)
    let roleStr: string = payload.role || ''

    if (!roleStr) {
      const dbUser = await userRepository.findById(payload.userId)
      roleStr = dbUser?.role || ''
    }

    const normalizedRole = roleStr.toLowerCase()
    const isAdmin = normalizedRole === 'admin' || normalizedRole === 'super_admin'

    if (!isAdmin) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { error: 'Forbidden. User lacks admin privileges.' },
          { status: 403 }
        ),
      }
    }

    return {
      isAuthorized: true,
      userId: payload.userId,
      role: roleStr || 'admin',
    }
  } catch (error) {
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { error: 'Forbidden. Invalid or expired token.' },
        { status: 403 }
      ),
    }
  }
}
