'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'

// ─── Guard ────────────────────────────────────────────────────────────────────

async function requireClient() {
  const session = await getServerSession()
  if (!session) throw new Error('Необходима авторизация')
  return session
}

// ─── Список сессий клиента ────────────────────────────────────────────────────

export async function getClientSessions() {
  const user = await requireClient()

  return prisma.session.findMany({
    where: { userId: user.id },
    include: {
      reader: { select: { id: true, name: true, specialization: true, tier: true } },
      order: { select: { amount: true, status: true } },
      asyncReading: { select: { status: true, resultText: true, completedAt: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Конкретная сессия клиента ────────────────────────────────────────────────

export async function getClientSession(sessionId: string) {
  const user = await requireClient()

  return prisma.session.findFirst({
    where: { id: sessionId, userId: user.id },
    include: {
      reader: { select: { id: true, name: true, specialization: true, tier: true, bio: true } },
      order: true,
      asyncReading: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })
}

// ─── Профиль клиента ──────────────────────────────────────────────────────────

export async function getClientProfile() {
  const session = await requireClient()
  return prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, dateOfBirth: true, createdAt: true },
  })
}
