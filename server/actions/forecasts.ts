'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'
import { revalidatePath } from 'next/cache'

// ─── Public reads ─────────────────────────────────────────────────────────────

export async function getWeeklyInsight() {
  return prisma.weeklyInsight.findFirst({
    where: { published: true },
    orderBy: { weekStart: 'desc' },
  })
}

export async function getGlobalForecasts() {
  return prisma.globalForecast.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })
}

export async function getCalendarEvents() {
  return prisma.calendarEvent.findMany({
    where: { published: true, eventDate: { gte: new Date() } },
    orderBy: { eventDate: 'asc' },
    take: 20,
  })
}

export async function getBreakingInsights() {
  return prisma.breakingInsight.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
}

export async function getAiForecasts() {
  return prisma.aiForecast.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

export async function getForecastAccuracy() {
  const all = await prisma.forecastAccuracy.findMany({
    where: { published: true },
    orderBy: { predictedAt: 'desc' },
    take: 10,
  })
  const resolved = all.filter(a => a.resolvedAt)
  const accurate = resolved.filter(a => a.accurate)
  const percentage = resolved.length > 0 ? Math.round((accurate.length / resolved.length) * 100) : 0
  return { items: all, percentage, total: resolved.length }
}

// ─── Reactions ────────────────────────────────────────────────────────────────

export async function toggleReaction(targetId: string, targetType: string, type: 'like' | 'dislike') {
  const session = await getServerSession()
  if (!session) return { error: 'Необходима авторизация' }

  const existing = await prisma.reaction.findUnique({
    where: { userId_targetId_targetType: { userId: session.id, targetId, targetType } },
  })

  const modelMap: Record<string, string> = {
    weekly: 'weeklyInsight', global: 'globalForecast',
    breaking: 'breakingInsight', ai: 'aiForecast',
  }
  const model = modelMap[targetType]
  if (!model) return { error: 'Invalid target' }

  const updateCounter = async (field: string, delta: number) => {
    await (prisma as any)[model].update({
      where: { id: targetId },
      data: { [field]: { increment: delta } },
    })
  }

  if (existing) {
    if (existing.type === type) {
      // Remove reaction
      await prisma.reaction.delete({ where: { id: existing.id } })
      await updateCounter(type === 'like' ? 'likes' : 'dislikes', -1)
      return { action: 'removed' }
    } else {
      // Switch reaction
      await prisma.reaction.update({ where: { id: existing.id }, data: { type } })
      await updateCounter(existing.type === 'like' ? 'likes' : 'dislikes', -1)
      await updateCounter(type === 'like' ? 'likes' : 'dislikes', 1)
      return { action: 'switched' }
    }
  }

  // New reaction
  await prisma.reaction.create({
    data: { userId: session.id, targetId, targetType, type },
  })
  await updateCounter(type === 'like' ? 'likes' : 'dislikes', 1)
  revalidatePath('/insights')
  return { action: 'added' }
}

export async function getUserReactions() {
  const session = await getServerSession()
  if (!session) return []
  return prisma.reaction.findMany({
    where: { userId: session.id },
    select: { targetId: true, targetType: true, type: true },
  })
}

// ─── Admin: bulk likes (накрутка) ─────────────────────────────────────────────

export async function adminAddLikes(targetId: string, targetType: string, count: number) {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Forbidden' }

  const modelMap: Record<string, string> = {
    weekly: 'weeklyInsight', global: 'globalForecast',
    breaking: 'breakingInsight', ai: 'aiForecast',
  }
  const model = modelMap[targetType]
  if (!model) return { error: 'Invalid target' }

  await (prisma as any)[model].update({
    where: { id: targetId },
    data: { likes: { increment: count } },
  })
  revalidatePath('/insights')
  return { success: true }
}
