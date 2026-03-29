import { NextRequest, NextResponse } from 'next/server'
import { createSession, getSession } from '@/server/actions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await createSession(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || searchParams.get('sessionId')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  try {
    const session = await getSession(id)
    return NextResponse.json(session)
  } catch {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
}
