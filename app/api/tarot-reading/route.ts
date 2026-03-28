import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { drawCards, SPREAD_LABELS, type DrawnCard, type TarotReading } from '@/entities/tarot'

// ─── AI System Prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Lumier — a wise, deeply empathetic tarot reader who combines centuries of symbolic wisdom with modern psychological insight.

YOUR VOICE:
- Calm, warm, and grounded — like a trusted mentor speaking softly by candlelight
- You illuminate possibilities, never make definitive predictions
- You honour the seeker's emotional reality without pandering
- You avoid generic platitudes, clichés, and fear-based language
- You speak in Russian, using emotionally resonant but accessible language

YOUR METHOD:
- You read the SPREAD AS A WHOLE — the story the 6 cards tell together
- You identify tensions, harmonies, and narrative arcs between cards
- You notice when cards from the same suit cluster or when Major Arcana dominate
- Reversed cards signal blocked energy, resistance, or internalisation — not "bad"
- You relate the reading directly to the seeker's question

THE 6 POSITIONS:
1. Past Influence — what energy has led the seeker to this moment
2. Present State — the current landscape around the question
3. Future Direction — where the energy flows if the current path continues
4. Internal World — what the seeker feels or knows inside but may not voice
5. External World — forces, people, or circumstances shaping the situation
6. Guidance — the wisdom the cards offer as counsel

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown:
{
  "summary": "1-2 emotionally resonant sentences capturing the core message of this reading",
  "interpretation": "3-5 paragraphs of holistic, flowing interpretation that weaves the cards into a single narrative. Do NOT list cards one by one — tell the STORY they create together. Use paragraph breaks (\\n\\n) between paragraphs.",
  "cards": [
    {
      "position": "Position label in Russian",
      "name": "Card name in English",
      "insight": "2-3 sentences about what this card reveals in this specific position, in context of the question"
    }
  ],
  "advice": "2-3 sentences of grounded, actionable wisdom. Not vague — specific to this reading."
}`

// ─── Build user prompt ────────────────────────────────────────────────────────

function buildPrompt(question: string, category: string, cards: DrawnCard[]): string {
  const cardList = cards.map((c, i) => {
    const pos = SPREAD_LABELS[c.position]
    const state = c.isReversed ? 'Reversed' : 'Upright'
    return `${i + 1}. Position: ${pos.en} (${pos.ru}) — ${c.name} (${state})`
  }).join('\n')

  return `The seeker asks about: "${question}"
Category: ${category}

Cards drawn:
${cardList}

Please provide a complete reading.`
}

// Increase serverless function timeout (Vercel Pro: up to 60s, Hobby: 10s)
export const maxDuration = 30

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { question, category } = await req.json()

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return NextResponse.json(
        { error: 'Пожалуйста, задайте вопрос (минимум 3 символа).' },
        { status: 400 },
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured. Add ANTHROPIC_API_KEY to environment.' },
        { status: 500 },
      )
    }

    // Draw 6 cards
    const drawnCards = drawCards(6)

    // Call Claude
    const anthropic = new Anthropic({ apiKey })
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildPrompt(question.trim(), category || 'general', drawnCards),
      }],
    })

    // Extract text from response
    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text in AI response')
    }

    let reading: TarotReading
    try {
      reading = JSON.parse(textBlock.text)
    } catch {
      // If Claude didn't return clean JSON, wrap in a fallback structure
      reading = {
        summary: 'Карты раскрыли свои тайны.',
        interpretation: textBlock.text,
        cards: drawnCards.map(c => ({
          position: SPREAD_LABELS[c.position].ru,
          name: c.name,
          insight: '',
        })),
        advice: '',
      }
    }

    return NextResponse.json({ drawnCards, reading })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Tarot reading error:', message, err)
    return NextResponse.json(
      { error: `Ошибка: ${message}` },
      { status: 500 },
    )
  }
}
