'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type DrawnCard, type TarotReading, type Gender,
  SPREAD_LABELS, SUIT_SYMBOLS, SPREAD_ORDER,
} from '@/entities/tarot'
import { MAJOR_SYMBOLS, ROMAN } from '@/entities/tarot/deck'
import { dur, ease } from '@/shared/animations/variants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Phase = 'question' | 'drawing' | 'reading'

function clean(text: string): string {
  if (!text) return ''
  return text
    .replace(/^```(?:json)?\s*/i, '').replace(/```$/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\/g, '')
    .trim()
}

function paragraphs(text: string): string[] {
  return clean(text).split(/\n\n+/).filter(p => p.trim().length > 0)
}

const CATEGORIES = [
  { id: 'relationships', label: 'Отношения' },
  { id: 'career',        label: 'Карьера' },
  { id: 'growth',        label: 'Рост' },
  { id: 'future',        label: 'Будущее' },
  { id: 'general',       label: 'Общее' },
]

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male',        label: 'Мужчина' },
  { id: 'female',      label: 'Женщина' },
  { id: 'unspecified', label: 'Не указывать' },
]

// Suit gradient accents for card backgrounds
const SUIT_GRADIENTS: Record<string, string> = {
  wands:     'linear-gradient(170deg, #2A1A0A 0%, #1A1008 100%)',
  cups:      'linear-gradient(170deg, #0A1A2A 0%, #081018 100%)',
  swords:    'linear-gradient(170deg, #1A1A2A 0%, #101018 100%)',
  pentacles: 'linear-gradient(170deg, #1A2A1A 0%, #102010 100%)',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TarotClient() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('question')
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('general')
  const [gender, setGender] = useState<Gender>('unspecified')
  const [error, setError] = useState('')

  const [cards, setCards] = useState<DrawnCard[]>([])
  const [reading, setReading] = useState<TarotReading | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [apiDone, setApiDone] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (question.trim().length < 3) {
      setError('Опишите ваш вопрос подробнее')
      return
    }
    setError('')
    setPhase('drawing')

    try {
      const res = await fetch('/api/tarot-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), category, gender }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка')
      setCards(data.drawnCards)
      setReading(data.reading)
      setApiDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка соединения')
      setPhase('question')
    }
  }, [question, category, gender])

  useEffect(() => {
    if (phase !== 'drawing' || cards.length === 0) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealedCount(i)
      if (i >= 6) clearInterval(interval)
    }, 700)
    return () => clearInterval(interval)
  }, [phase, cards.length])

  useEffect(() => {
    if (revealedCount >= 6 && apiDone) {
      const timer = setTimeout(() => setPhase('reading'), 800)
      return () => clearTimeout(timer)
    }
  }, [revealedCount, apiDone])

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="glass sticky top-0 z-30" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
            ← Назад
          </button>
          <p className="font-serif text-base font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>Lumier</p>
        </div>
      </div>

      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(212,149,74,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 mx-auto max-w-2xl px-6">
        <AnimatePresence mode="wait">
          {phase === 'question' && (
            <QuestionPhase key="q" question={question} setQuestion={setQuestion}
              category={category} setCategory={setCategory}
              gender={gender} setGender={setGender}
              error={error} onSubmit={handleSubmit} />
          )}
          {phase === 'drawing' && (
            <DrawingPhase key="d" cards={cards} revealedCount={revealedCount} apiDone={apiDone} />
          )}
          {phase === 'reading' && reading && (
            <ReadingPhase key="r" cards={cards} reading={reading} question={question}
              onNewReading={() => {
                setPhase('question'); setQuestion(''); setCards([]); setReading(null)
                setRevealedCount(0); setApiDone(false)
              }} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1 — QUESTION
// ═══════════════════════════════════════════════════════════════════════════════

function QuestionPhase({
  question, setQuestion, category, setCategory, gender, setGender, error, onSubmit,
}: {
  question: string; setQuestion: (q: string) => void
  category: string; setCategory: (c: string) => void
  gender: Gender; setGender: (g: Gender) => void
  error: string; onSubmit: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }} transition={{ duration: dur.slow, ease: ease.outSoft }}
      className="pt-12 pb-20 space-y-6"
    >
      {/* Title */}
      <div className="text-center space-y-3">
        <p className="label-overline" style={{ color: 'var(--gold)' }}>Таро расклад</p>
        <h1 className="font-serif font-light" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
          О чём говорит ваше сердце?
        </h1>
        <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Задайте вопрос — карты раскроют скрытое.
        </p>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <p className="label-overline text-center" style={{ color: 'var(--text-muted)' }}>Ваш пол</p>
        <div className="flex justify-center gap-2">
          {GENDERS.map((g) => (
            <button key={g.id} onClick={() => setGender(g.id)}
              className="rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all"
              style={{
                background: g.id === gender ? 'var(--gold)' : 'var(--bg-raised)',
                color: g.id === gender ? '#0E1520' : 'var(--text-secondary)',
                border: g.id === gender ? '1px solid transparent' : '1px solid var(--border-subtle)',
              }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className="rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all"
            style={{
              background: cat.id === category ? 'rgba(212,149,74,0.15)' : 'var(--bg-raised)',
              color: cat.id === category ? 'var(--gold)' : 'var(--text-secondary)',
              border: `1px solid ${cat.id === category ? 'rgba(212,149,74,0.25)' : 'var(--border-subtle)'}`,
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
          placeholder="Я хочу понять..." rows={3} maxLength={500}
          className="w-full rounded-2xl px-5 py-4 font-sans text-sm outline-none resize-none"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', lineHeight: 1.8 }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(212,149,74,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,149,74,0.08)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none' }}
        />
        <div className="flex justify-between px-1">
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{question.length}/500</p>
          {error && <p className="font-sans text-xs" style={{ color: '#F87171' }}>{error}</p>}
        </div>
      </div>

      {/* Submit */}
      <div className="text-center">
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onSubmit}
          disabled={question.trim().length < 3}
          className="rounded-2xl px-10 py-4 font-sans text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 24px rgba(212,149,74,0.20)' }}>
          Раскрыть карты ✦
        </motion.button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2 — DRAWING (with shuffle ritual animation)
// ═══════════════════════════════════════════════════════════════════════════════

const SHUFFLE_MESSAGES = [
  'Перемешиваю колоду...',
  'Настраиваю связь...',
  'Чувствую энергию вопроса...',
  'Выбираю карты...',
]

function ShuffleDeck() {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % SHUFFLE_MESSAGES.length), 2200)
    return () => clearInterval(t)
  }, [])

  // 12 "cards" in a deck pile that shuffle around
  const deckCards = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Animated deck */}
      <div className="relative w-28 h-40">
        {deckCards.map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(160deg, #152030 0%, #1C2C40 50%, #152030 100%)',
              border: '1px solid rgba(212,149,74,0.15)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            initial={{ x: 0, y: -i * 1.5, rotate: 0 }}
            animate={{
              x: [0, (i % 2 === 0 ? 1 : -1) * (15 + Math.random() * 25), 0, (i % 2 === 0 ? -1 : 1) * (10 + Math.random() * 20), 0],
              y: [-i * 1.5, -i * 1.5 - 8, -i * 1.5 + 4, -i * 1.5 - 4, -i * 1.5],
              rotate: [0, (i % 2 === 0 ? 3 : -3), 0, (i % 2 === 0 ? -2 : 2), 0],
            }}
            transition={{
              duration: 2.0 + i * 0.12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.08,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ color: 'rgba(212,149,74,0.25)', fontSize: '1.5rem' }}>✦</span>
            </div>
          </motion.div>
        ))}

        {/* Glow under deck */}
        <motion.div
          className="absolute -inset-4 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,149,74,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* Shuffling text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}
        >
          {SHUFFLE_MESSAGES[msgIdx]}
        </motion.p>
      </AnimatePresence>

      {/* Pulsing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--gold)' }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>
    </div>
  )
}

function DrawingPhase({ cards, revealedCount, apiDone }: { cards: DrawnCard[]; revealedCount: number; apiDone: boolean }) {
  const hasCards = cards.length > 0
  const allRevealed = revealedCount >= 6

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
      transition={{ duration: dur.slow }} className="pt-12 pb-20">

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6 space-y-2"
      >
        <p className="label-overline" style={{ color: 'var(--gold)' }}>
          {!hasCards ? 'Ритуал начался' : allRevealed ? (apiDone ? 'Карты раскрыты' : 'Считываю энергию...') : 'Карты открываются'}
        </p>
        <h2 className="font-serif font-light" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          {!hasCards ? 'Колода перемешивается' : 'Шесть карт расклада'}
        </h2>
      </motion.div>

      {/* Shuffle animation — shown while waiting for API */}
      {!hasCards && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <ShuffleDeck />
        </motion.div>
      )}

      {/* Card grid — shown once cards arrive */}
      {hasCards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
            {SPREAD_ORDER.map((pos, i) => (
              <TarotCardUI key={pos} index={i}
                card={cards.find(c => c.position === pos)}
                isRevealed={i < revealedCount} position={pos} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Reading spinner after all cards revealed */}
      {!apiDone && hasCards && allRevealed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
          <div className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" style={{ color: 'var(--gold)' }} />
            <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Lumier читает расклад...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Card Component ───────────────────────────────────────────────────────────

function TarotCardUI({ index, card, isRevealed, position }: {
  index: number; card?: DrawnCard; isRevealed: boolean; position: string
}) {
  const label = SPREAD_LABELS[position as keyof typeof SPREAD_LABELS]
  const isMajor = card?.arcana === 'major'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.15 + 0.3, duration: 0.5, ease: ease.outSoft }}
      className="relative" style={{ perspective: '600px' }}
    >
      <motion.div
        animate={{ rotateY: isRevealed && card ? 180 : 0 }}
        transition={{ duration: 0.7, ease: ease.outSoft }}
        className="relative w-full" style={{ aspectRatio: '2.5/4', transformStyle: 'preserve-3d' }}
      >
        {/* ── Back ────────────────────────────────── */}
        <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(160deg, #152030 0%, #1C2C40 50%, #152030 100%)',
            border: '1px solid rgba(212,149,74,0.20)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,149,74,0.08) inset',
          }}>
          <div className="w-10 h-10 rounded-full mb-2 flex items-center justify-center"
            style={{ border: '1px solid rgba(212,149,74,0.3)', color: 'var(--gold)', fontSize: '1rem' }}>
            ✦
          </div>
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
            {label?.ru}
          </p>
        </div>

        {/* ── Face ────────────────────────────────── */}
        <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-between p-2.5 overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: isMajor
              ? 'linear-gradient(170deg, #1E2A3A 0%, #14202E 100%)'
              : card?.suit ? SUIT_GRADIENTS[card.suit] : 'var(--bg-raised)',
            border: `1px solid ${isMajor ? 'rgba(212,149,74,0.40)' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: isMajor ? '0 4px 24px rgba(212,149,74,0.15)' : '0 4px 24px rgba(0,0,0,0.4)',
          }}>

          {/* Position */}
          <p className="font-sans text-[0.45rem] uppercase tracking-[0.12em] text-center w-full"
            style={{ color: 'var(--text-muted)' }}>
            {label?.ru}
          </p>

          {/* Central symbol area */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-0.5">
            {isMajor && card && (
              <>
                <span style={{ color: 'var(--gold)', fontSize: '1.5rem', lineHeight: 1 }}>
                  {MAJOR_SYMBOLS[card.id] || '✦'}
                </span>
                <span className="font-serif text-[0.55rem] font-light" style={{ color: 'rgba(212,149,74,0.5)' }}>
                  {ROMAN[card.id]}
                </span>
              </>
            )}
            {!isMajor && card?.suit && (
              <span style={{ color: 'var(--gold)', fontSize: '1.4rem', opacity: 0.6 }}>
                {SUIT_SYMBOLS[card.suit]}
              </span>
            )}
            <p className="font-serif font-medium leading-tight px-1"
              style={{ fontSize: '0.7rem', color: isMajor ? 'var(--gold)' : 'var(--text-primary)' }}>
              {card?.nameRu}
            </p>
          </div>

          {/* State */}
          <p className="font-sans text-[0.45rem] uppercase tracking-widest"
            style={{ color: card?.isReversed ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.25)' }}>
            {card?.isReversed ? '↻ Перевёрнута' : 'Прямая'}
          </p>
        </div>
      </motion.div>

      {/* Reveal glow */}
      {isRevealed && card && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0] }} transition={{ duration: 1.2 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,149,74,0.18) 0%, transparent 70%)' }} />
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3 — READING
// ═══════════════════════════════════════════════════════════════════════════════

function ReadingPhase({ cards, reading, question, onNewReading }: {
  cards: DrawnCard[]; reading: TarotReading; question: string; onNewReading: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.slow, ease: ease.outSoft }}
      className="pt-10 pb-20 space-y-8">

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }} className="text-center space-y-3">
        <p className="label-overline" style={{ color: 'var(--gold)' }}>Ваш расклад</p>
        {clean(reading.summary) && (
          <blockquote className="font-serif font-light italic leading-relaxed mx-auto max-w-md"
            style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
            &ldquo;{clean(reading.summary)}&rdquo;
          </blockquote>
        )}
        <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{question}</p>
      </motion.div>

      <div className="gold-rule" />

      {/* Mini card strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-6 gap-1.5 max-w-sm mx-auto">
        {cards.map((card, i) => (
          <div key={card.id} className="rounded-lg p-1.5 text-center"
            style={{
              background: 'var(--bg-raised)',
              border: card.arcana === 'major' ? '1px solid rgba(212,149,74,0.25)' : '1px solid var(--border-subtle)',
            }}>
            <p className="font-sans text-[0.4rem] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
              {SPREAD_LABELS[SPREAD_ORDER[i]].ru}
            </p>
            <p className="font-serif text-[0.5rem] font-medium leading-tight"
              style={{ color: card.arcana === 'major' ? 'var(--gold)' : 'var(--text-secondary)' }}>
              {card.nameRu}
            </p>
            {card.isReversed && <p className="text-[0.35rem] mt-0.5" style={{ color: '#F87171', opacity: 0.6 }}>↻</p>}
          </div>
        ))}
      </motion.div>

      {/* Interpretation */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="reading-prose">
          {paragraphs(reading.interpretation).map((para, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}>
              {para}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Per-card insights */}
      {reading.cards?.length > 0 && reading.cards[0]?.insight && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          className="space-y-2.5">
          <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Позиции расклада</p>
          {reading.cards.map((ci, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + i * 0.08 }}
              className="rounded-xl px-4 py-3"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-sans text-xs uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                  {ci.position}
                </span>
                <span style={{ color: 'var(--border-default)' }}>·</span>
                <span className="font-serif text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {ci.name}
                </span>
              </div>
              <p className="font-sans text-base leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
                {clean(ci.insight)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Advice */}
      {clean(reading.advice) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}
          className="rounded-2xl p-5 text-center space-y-2"
          style={{ background: 'var(--bg-float)', border: '1px solid rgba(212,149,74,0.15)', boxShadow: '0 0 32px rgba(212,149,74,0.06)' }}>
          <p className="label-overline" style={{ color: 'var(--gold)' }}>Совет карт</p>
          <p className="font-serif font-light leading-relaxed mx-auto max-w-md"
            style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
            {clean(reading.advice)}
          </p>
        </motion.div>
      )}

      <div className="gold-rule" />

      {/* Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="flex flex-col items-center gap-3">
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onNewReading}
          className="rounded-2xl px-8 py-3 font-sans text-sm font-medium"
          style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 20px rgba(212,149,74,0.18)' }}>
          Новый расклад
        </motion.button>
        <button onClick={() => window.history.back()}
          className="font-sans text-xs transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
          Вернуться на главную
        </button>
      </motion.div>
    </motion.div>
  )
}
