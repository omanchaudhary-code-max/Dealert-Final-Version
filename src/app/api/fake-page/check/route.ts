import { NextRequest, NextResponse } from 'next/server'
import { runTrustCheck } from '@/lib/trust-score'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { url } = body

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    const result = await runTrustCheck(url.trim())
    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to perform trust check'
    const status = message.includes('Blocked host') || message.includes('Invalid URL') || message.includes('Domain resolution')
      ? 400
      : 500

    return NextResponse.json({ error: message }, { status })
  }
}