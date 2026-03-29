'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAdmin() {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') redirect('/')
  return session
}

// ─── Weekly Insight ───────────────────────────────────────────────────────────

export async function createWeeklyInsight(formData: FormData) {
  await requireAdmin()
  await prisma.weeklyInsight.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      tone: formData.get('tone') as string || 'нейтрально',
      weekStart: new Date(formData.get('weekStart') as string),
      published: formData.get('published') === 'true',
    },
  })
  revalidatePath('/insights')
  redirect('/admin/forecasts')
}

// ─── Global Forecast ──────────────────────────────────────────────────────────

export async function createGlobalForecast(formData: FormData) {
  await requireAdmin()
  await prisma.globalForecast.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as string || 'politics',
      published: formData.get('published') === 'true',
    },
  })
  revalidatePath('/insights')
  redirect('/admin/forecasts')
}

// ─── Calendar Event ───────────────────────────────────────────────────────────

export async function createCalendarEvent(formData: FormData) {
  await requireAdmin()
  await prisma.calendarEvent.create({
    data: {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      eventDate: new Date(formData.get('eventDate') as string),
      forecast: (formData.get('forecast') as string) || null,
      published: formData.get('published') === 'true',
    },
  })
  revalidatePath('/insights')
  redirect('/admin/forecasts')
}

// ─── Breaking Insight ─────────────────────────────────────────────────────────

export async function createBreakingInsight(formData: FormData) {
  await requireAdmin()
  await prisma.breakingInsight.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      urgency: formData.get('urgency') as string || 'medium',
      published: formData.get('published') === 'true',
    },
  })
  revalidatePath('/insights')
  redirect('/admin/forecasts')
}

// ─── AI Forecast ──────────────────────────────────────────────────────────────

export async function createAiForecast(formData: FormData) {
  await requireAdmin()
  await prisma.aiForecast.create({
    data: {
      title: formData.get('title') as string,
      prediction: formData.get('prediction') as string,
      basis: formData.get('basis') as string,
      published: formData.get('published') === 'true',
    },
  })
  revalidatePath('/insights')
  redirect('/admin/forecasts')
}

// ─── Forecast Accuracy ────────────────────────────────────────────────────────

export async function createForecastAccuracy(formData: FormData) {
  await requireAdmin()
  const resolvedAt = formData.get('resolvedAt') as string
  await prisma.forecastAccuracy.create({
    data: {
      prediction: formData.get('prediction') as string,
      outcome: formData.get('outcome') as string,
      accurate: formData.get('accurate') === 'true',
      category: formData.get('category') as string || 'general',
      predictedAt: new Date(formData.get('predictedAt') as string),
      resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
      published: formData.get('published') === 'true',
    },
  })
  revalidatePath('/insights')
  redirect('/admin/forecasts')
}

// ─── Delete any forecast item ─────────────────────────────────────────────────

export async function deleteForecastItem(id: string, type: string) {
  await requireAdmin()
  const map: Record<string, string> = {
    weekly: 'weeklyInsight', global: 'globalForecast', calendar: 'calendarEvent',
    breaking: 'breakingInsight', ai: 'aiForecast', accuracy: 'forecastAccuracy',
  }
  const model = map[type]
  if (model) await (prisma as any)[model].delete({ where: { id } })
  revalidatePath('/insights')
  revalidatePath('/admin/forecasts')
}

// ─── Get all for admin ────────────────────────────────────────────────────────

export async function getAllForecastsAdmin() {
  await requireAdmin()
  const [weekly, globals, calendar, breaking, ai, accuracy] = await Promise.all([
    prisma.weeklyInsight.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.globalForecast.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.calendarEvent.findMany({ orderBy: { eventDate: 'asc' }, take: 20 }),
    prisma.breakingInsight.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.aiForecast.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.forecastAccuracy.findMany({ orderBy: { predictedAt: 'desc' }, take: 10 }),
  ])
  return { weekly, globals, calendar, breaking, ai, accuracy }
}
