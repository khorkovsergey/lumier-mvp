'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'

export async function getUserTarotReadings() {
  const session = await getServerSession()
  if (!session) return []

  return prisma.tarotReadingRecord.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      question: true,
      category: true,
      summary: true,
      createdAt: true,
    },
  })
}

export async function getTarotReadingById(id: string) {
  const session = await getServerSession()
  if (!session) return null

  return prisma.tarotReadingRecord.findFirst({
    where: { id, userId: session.id },
  })
}
