// src/app/api/claude-match/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'Claude API error' }, { status: 502 })
    }

    const data = await response.json()
    const analysis = data.content?.[0]?.text ?? 'No analysis returned.'

    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('Route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
