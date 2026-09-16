import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { authConfig } from '@/config/auth.config'
import { authService } from '@/services/auth.service'

export async function GET(request: NextRequest) {
  const isConfigured =
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_ID.trim() !== '' &&
    !env.GOOGLE_CLIENT_ID.includes('your-google-client-id')

  if (!isConfigured) {
    try {
      await authService.handleGoogleOAuth({
        id: 'google-dev-12345',
        email: 'google.user@dealert.com',
        name: 'Google User',
        accessToken: 'dev-google-access-token',
      })
      const url = new URL('/dashboard?auth=google_success', request.url)
      return NextResponse.redirect(url)
    } catch (err) {
      console.error('Google OAuth dev fallback error:', err)
      const url = new URL('/login?error=oauth_failed', request.url)
      return NextResponse.redirect(url)
    }
  }

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: authConfig.google.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })

  return NextResponse.redirect(`${authConfig.google.authUrl}?${params}`)
}