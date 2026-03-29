import { prisma } from '@/shared/lib/prisma'
import { sendTelegramMessage } from '@/shared/lib/telegram'
import type { SendMessageInput } from './types'

export async function sendMessage(input: SendMessageInput) {
  const message = await prisma.message.create({ data: input })

  // If client sent a message, forward to reader's Telegram
  if (input.senderType === 'USER') {
    _forwardToTelegram(input.sessionId, input.content).catch(console.error)
  }

  return message
}

export async function getMessages(sessionId: string) {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function sendReaderGreeting(sessionId: string, readerName: string) {
  const existing = await prisma.message.findFirst({
    where: { sessionId, senderType: 'READER' },
  })
  if (existing) return existing

  // Notify reader via Telegram about new session
  _notifyReaderSessionStart(sessionId).catch(console.error)

  return prisma.message.create({
    data: {
      sessionId,
      senderType: 'READER',
      content: `Добро пожаловать. Я ${readerName}. Я готов работать с вашим вопросом. Расскажите, что вас волнует.`,
    },
  })
}

async function _notifyReaderSessionStart(sessionId: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        reader: true,
        user: { select: { name: true, dateOfBirth: true } },
      },
    })
    if (!session?.reader?.telegramChatId) return

    const clientName = session.user.name || 'Клиент'
    const dob = session.user.dateOfBirth
      ? new Date(session.user.dateOfBirth).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'не указана'

    const text =
      `🔔 <b>Новая консультация</b>\n\n` +
      `👤 Клиент: ${clientName}\n` +
      `📅 Дата рождения: ${dob}\n\n` +
      `<i>Клиент начал с вами консультацию. Сообщения будут приходить сюда.</i>`

    await sendTelegramMessage(session.reader.telegramChatId, text)
  } catch (err) {
    console.error('Failed to notify reader:', err)
  }
}

async function _forwardToTelegram(sessionId: string, clientMessage: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        reader: true,
        user: { select: { name: true } },
      },
    })

    if (!session?.reader?.telegramChatId) return

    const clientName = session.user.name || 'Клиент'
    const text =
      `📩 <b>Новое сообщение от клиента</b>\n\n` +
      `👤 ${clientName}\n` +
      `💬 ${clientMessage}\n\n` +
      `<i>Ответьте прямо здесь — клиент увидит в приложении</i>`

    await sendTelegramMessage(session.reader.telegramChatId, text)
  } catch (err) {
    console.error('Failed to forward to Telegram:', err)
  }
}
