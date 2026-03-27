// Simple password hashing without bcrypt dependency
// Uses Node.js built-in crypto — sufficient for MVP
import { createHash, randomBytes, timingSafeEqual } from 'crypto'

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = createHash('sha256').update(salt + password).digest('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':')
    const incoming = createHash('sha256').update(salt + password).digest('hex')
    return timingSafeEqual(Buffer.from(hash), Buffer.from(incoming))
  } catch {
    return false
  }
}
