import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE = 'lumier_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

// ─── Simple session table (stored in cookie as userId:role:timestamp) ─────────
// For production: use NextAuth or proper JWT. This is MVP-grade.

export function createSessionToken(userId: string, role: string): string {
  const payload = `${userId}:${role}:${Date.now()}`
  // Base64 encode — NOT cryptographically secure, replace with JWT for prod
  return Buffer.from(payload).toString('base64')
}

export function parseSessionToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId, role, timestamp] = decoded.split(':')
    if (!userId || !role) return null
    // Check expiry
    if (Date.now() - parseInt(timestamp) > SESSION_DURATION) return null
    return { userId, role }
  } catch {
    return null
  }
}

export async function getServerSession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const parsed = parseSessionToken(token)
    if (!parsed) return null

    const user = await prisma.user.findUnique({
      where: { id: parsed.userId },
      select: { id: true, name: true, email: true, role: true, readerProfile: { select: { id: true } } },
    })
    return user
  } catch {
    return null
  }
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
}
