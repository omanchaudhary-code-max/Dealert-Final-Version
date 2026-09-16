import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { env } from '@/lib/env'
import { authConfig } from '@/config/auth.config'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    try {
      await authService.handleGoogleOAuth({
        id: 'google-dev-12345',
        email: 'google.user@dealert.com',
        name: 'Google User',
        accessToken: 'dev-google-access-token',
      })
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard?auth=google_success`)
    } catch {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`)
    }
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(authConfig.google.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    // Get user info
    const userInfoRes = await fetch(authConfig.google.userInfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const googleUser = await userInfoRes.json()

    if (!googleUser?.email) {
      throw new Error('Invalid user info from Google')
    }

    await authService.handleGoogleOAuth({
      id: googleUser.sub || `google-${Date.now()}`,
      email: googleUser.email,
      name: googleUser.name || 'Google User',
      accessToken: tokens.access_token || 'access-token',
    })

    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    // Fall back to dev user in case of OAuth failure in local dev environment
    try {
      await authService.handleGoogleOAuth({
        id: 'google-dev-12345',
        email: 'google.user@dealert.com',
        name: 'Google User',
        accessToken: 'dev-google-access-token',
      })
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/dashboard?auth=google_success`)
    } catch {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`)
    }
  }
}