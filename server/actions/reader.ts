'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'
import { revalidatePath } from 'next/cache'

// ─── Guard helper ─────────────────────────────────────────────────────────────

async function requireReader() {
  const session = await getServerSession()
  if (!session || session.role !== 'READER') {
    throw new Error('Доступ запрещён')
  }
  const reader = await prisma.tarotReader.findUnique({
    where: { userId: session.id },
  })
  if (!reader) throw new Error('Профиль консультанта не найден')
  return { user: session, reader }
}

// ─── Dashboard — список сессий ────────────────────────────────────────────────

export async function getReaderSessions() {
  const { reader } = await requireReader()

  return prisma.session.findMany({
    where: { readerId: reader.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      order: { select: { amount: true, status: true } },
      asyncReading: { select: { status: true, resultText: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Конкретная сессия ────────────────────────────────────────────────────────

export async function getReaderSession(sessionId: string) {
  const { reader } = await requireReader()

  const session = await prisma.session.findFirst({
    where: { id: sessionId, readerId: reader.id },
    include: {
      user: { select: { id: true, name: true, email: true, dateOfBirth: true } },
      order: true,
      asyncReading: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!session) throw new Error('Сессия не найдена')
  return session
}

// ─── Отправить сообщение (чат) ────────────────────────────────────────────────

export async function readerSendMessage(sessionId: string, content: string) {
  const { reader } = await requireReader()

  // Verify this reader owns the session
  const session = await prisma.session.findFirst({
    where: { id: sessionId, readerId: reader.id },
  })
  if (!session) throw new Error('Сессия не найдена')

  const message = await prisma.message.create({
    data: {
      sessionId,
      senderType: 'READER',
      content,
      type: 'TEXT',
    },
  })

  revalidatePath(`/reader/session/${sessionId}`)
  return { success: true, message }
}

// ─── Сохранить черновик расклада ──────────────────────────────────────────────

export async function saveReadingDraft(sessionId: string, draftText: string) {
  const { reader } = await requireReader()

  const session = await prisma.session.findFirst({
    where: { id: sessionId, readerId: reader.id },
    include: { asyncReading: true },
  })
  if (!session) throw new Error('Сессия не найдена')

  if (session.asyncReading) {
    await prisma.asyncReading.update({
      where: { sessionId },
      data: { draftText },
    })
  }

  return { success: true }
}

// ─── Опубликовать расклад ─────────────────────────────────────────────────────

export async function publishReading(sessionId: string, resultText: string) {
  const { reader } = await requireReader()

  const session = await prisma.session.findFirst({
    where: { id: sessionId, readerId: reader.id },
    include: { asyncReading: true },
  })
  if (!session) throw new Error('Сессия не найдена')

  // 1. Обновить AsyncReading — результат виден клиенту
  if (session.asyncReading) {
    await prisma.asyncReading.update({
      where: { sessionId },
      data: {
        status: 'COMPLETED',
        resultText,
        completedAt: new Date(),
      },
    })
  }

  // 2. Отправить как особое сообщение в чат
  await prisma.message.create({
    data: {
      sessionId,
      senderType: 'READER',
      content: resultText,
      type: 'READING_PUBLISHED',
    },
  })

  // 3. Закрыть сессию
  await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED' },
  })

  revalidatePath(`/reader/session/${sessionId}`)
  revalidatePath('/reader/dashboard')
  return { success: true }
}

// ─── Принять сессию в работу ──────────────────────────────────────────────────

export async function acceptSession(sessionId: string) {
  const { reader } = await requireReader()

  const session = await prisma.session.findFirst({
    where: { id: sessionId, readerId: reader.id, status: 'PENDING' },
    include: { asyncReading: true },
  })
  if (!session) throw new Error('Сессия не найдена или уже принята')

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'ACTIVE' },
  })

  if (session.asyncReading) {
    await prisma.asyncReading.update({
      where: { sessionId },
      data: { status: 'IN_PROGRESS' },
    })
  }

  revalidatePath('/reader/dashboard')
  return { success: true }
}

// ─── Получить профиль консультанта ────────────────────────────────────────────

export async function getReaderProfile() {
  const { reader, user } = await requireReader()
  return { ...reader, email: user.email, userName: user.name }
}

// ─── Обновить профиль ─────────────────────────────────────────────────────────

export async function updateReaderProfile(data: {
  bio?: string
  specialization?: string
  price?: number
}) {
  const { reader } = await requireReader()

  const updated = await prisma.tarotReader.update({
    where: { id: reader.id },
    data: {
      ...(data.bio && { bio: data.bio }),
      ...(data.specialization && { specialization: data.specialization }),
      ...(data.price && { price: data.price }),
    },
  })

  revalidatePath('/reader/dashboard')
  return { success: true, reader: updated }
}
