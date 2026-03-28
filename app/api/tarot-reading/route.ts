import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { drawCards, SPREAD_LABELS, type DrawnCard, type TarotReading } from '@/entities/tarot'
import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'

// ─── AI System Prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты — Lumier, мудрый таролог с психологическим пониманием.

ПРАВИЛА:
- Пиши ТОЛЬКО на русском
- Называй карты ТОЛЬКО по-русски
- Не используй слова: summary, interpretation, advice, insight, position — и любые англоязычные термины
- Будь кратким: максимум 2–3 коротких абзаца в интерпретации
- Читай расклад целиком как единую историю, не перечисляй карты по одной
- Перевёрнутые карты — заблокированная энергия, не «плохое»
- Никаких гарантий, страхов и банальностей
- Учитывай пол человека при обращении (если указан)

6 ПОЗИЦИЙ:
1. Прошлое 2. Настоящее 3. Будущее 4. Внутренний мир 5. Внешний мир 6. Совет

Верни ТОЛЬКО валидный JSON без markdown, без тройных кавычек:
{
  "summary": "1 предложение — суть расклада",
  "interpretation": "2–3 коротких абзаца. Рассказывай историю карт, не перечисляй.",
  "cards": [
    {"position": "Позиция", "name": "Название карты по-русски", "insight": "1–2 предложения"}
  ],
  "advice": "1–2 предложения конкретного совета."
}`

// ─── Build user prompt ────────────────────────────────────────────────────────

function buildPrompt(question: string, category: string, gender: string, cards: DrawnCard[]): string {
  const genderLabel =
    gender === 'male' ? 'мужчина' :
    gender === 'female' ? 'женщина' : 'не указан'

  const cardList = cards.map((c, i) => {
    const pos = SPREAD_LABELS[c.position]
    const state = c.isReversed ? '(перевёрнута)' : '(прямая)'
    return `${i + 1}. ${pos.ru}: ${c.nameRu} ${state}`
  }).join('\n')

  return `Пол: ${genderLabel}
Тема: ${category}
Вопрос: «${question}»

Карты:
${cardList}`
}

// Increase serverless function timeout
export const maxDuration = 30

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { question, category, gender } = await req.json()

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return NextResponse.json(
        { error: 'Пожалуйста, задайте вопрос (минимум 3 символа).' },
        { status: 400 },
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI-сервис не настроен.' },
        { status: 500 },
      )
    }

    const drawnCards = drawCards(6)

    const anthropic = new Anthropic({ apiKey })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildPrompt(question.trim(), category || 'общее', gender || 'unspecified', drawnCards),
      }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Пустой ответ от AI')
    }

    // Strip markdown fences if present
    let raw = textBlock.text.trim()
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    }

    let reading: TarotReading
    try {
      reading = JSON.parse(raw)
    } catch {
      reading = {
        summary: '',
        interpretation: raw,
        cards: drawnCards.map(c => ({
          position: SPREAD_LABELS[c.position].ru,
          name: c.nameRu,
          insight: '',
        })),
        advice: '',
      }
    }

    // Save for authenticated users (fire-and-forget)
    const session = await getServerSession().catch(() => null)
    if (session?.id) {
      prisma.tarotReadingRecord.create({
        data: {
          userId:         session.id,
          question:       question.trim(),
          category:       category || 'general',
          cardsJson:      JSON.stringify(drawnCards),
          summary:        reading.summary || '',
          interpretation: reading.interpretation || '',
          cardsInsight:   JSON.stringify(reading.cards || []),
          advice:         reading.advice || '',
        },
      }).catch(() => {}) // don't fail the response if save fails
    }

    return NextResponse.json({ drawnCards, reading })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Tarot reading error:', message)
    return NextResponse.json(
      { error: `Ошибка: ${message}` },
      { status: 500 },
    )
  }
}
