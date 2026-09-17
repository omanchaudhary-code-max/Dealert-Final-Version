import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth.service'
import { env } from '@/lib/env'
import { authConfig } from '@/config/auth.config'

const isDev = process.env.NODE_ENV === 'development'

async function devBypassLogin() {
  // Local-dev-only convenience login. Never reachable in production —
  // gated by isDev so a missing/failed OAuth code can't silently log
  // a visitor in as this fake account on the live site.
  await authService.handleGoogleOAuth({
    id: 'google-dev-12345',
    email: 'google.user@dealert.com',
    name: 'Google User',
    accessToken: 'dev-google-access-token',
  })
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const baseUrl = env.NEXT_PUBLIC_APP_URL

  if (!code) {
    if (isDev) {
      try {
        await devBypassLogin()
        return NextResponse.redirect(`${baseUrl}/dashboard?auth=google_success`)
      } catch {
        return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
      }
    }
    // Production: no code means this wasn't a real Google redirect — reject it.
    return NextResponse.redirect(`${baseUrl}/login?error=missing_code`)
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

    if (!tokenRes.ok || !tokens.access_token) {
      throw new Error(`Google token exchange failed: ${JSON.stringify(tokens)}`)
    }

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
      accessToken: tokens.access_token,
    })

    return NextResponse.redirect(`${baseUrl}/dashboard`)
  } catch (err) {
    console.error('OAuth callback error:', err)

    if (isDev) {
      // Local dev only: fall back to the fake account so frontend work
      // isn't blocked by a real Google OAuth misconfiguration locally.
      try {
        await devBypassLogin()
        return NextResponse.redirect(`${baseUrl}/dashboard?auth=google_success`)
      } catch {
        return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
      }
    }

    // Production: a real failure must show as a real failure, never a silent fake login.
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
  }
}