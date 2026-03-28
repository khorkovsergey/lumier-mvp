'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageIn, staggerNormal, revealNormal, revealSubtle } from '@/shared/animations/variants'

function clean(text: string): string {
  if (!text) return ''
  return text.replace(/^```(?:json)?\s*/i, '').replace(/```$/g, '').replace(/\\n/g, '\n').replace(/\\/g, '').trim()
}

function paragraphs(text: string): string[] {
  return clean(text).split(/\n\n+/).filter(p => p.trim().length > 0)
}

interface CardInsight { position: string; name: string; insight: string }

interface Reading {
  id: string
  question: string
  category: string
  cardsJson: string
  summary: string
  interpretation: string
  cardsInsight: string
  advice: string
  createdAt: Date | string
}

export function TarotHistoryDetail({ reading }: { reading: Reading }) {
  const router = useRouter()

  let cardInsights: CardInsight[] = []
  try { cardInsights = JSON.parse(reading.cardsInsight) } catch {}

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <div className="glass sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/cabinet')}
            className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}>
            ← Кабинет
          </button>
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date(reading.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8 space-y-8">
        {/* Summary */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="text-center space-y-3">
          <motion.p variants={revealSubtle} className="label-overline" style={{ color: 'var(--gold)' }}>
            Ваш расклад
          </motion.p>
          {clean(reading.summary) && (
            <motion.blockquote variants={revealNormal}
              className="font-serif font-light italic leading-relaxed mx-auto max-w-md"
              style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              &ldquo;{clean(reading.summary)}&rdquo;
            </motion.blockquote>
          )}
          <motion.p variants={revealSubtle} className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            {reading.question}
          </motion.p>
        </motion.div>

        <div className="gold-rule" />

        {/* Interpretation */}
        <div className="reading-prose">
          {paragraphs(reading.interpretation).map((para, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}>
              {para}
            </motion.p>
          ))}
        </div>

        {/* Card insights */}
        {cardInsights.length > 0 && cardInsights[0]?.insight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="space-y-2.5">
            <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Позиции расклада</p>
            {cardInsights.map((ci, i) => (
              <div key={i} className="rounded-xl px-4 py-3"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-sans text-[0.55rem] uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                    {ci.position}
                  </span>
                  <span style={{ color: 'var(--border-default)' }}>·</span>
                  <span className="font-serif text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {ci.name}
                  </span>
                </div>
                <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {clean(ci.insight)}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Advice */}
        {clean(reading.advice) && (
          <div className="rounded-2xl p-5 text-center space-y-2"
            style={{ background: 'var(--bg-float)', border: '1px solid rgba(212,149,74,0.15)' }}>
            <p className="label-overline" style={{ color: 'var(--gold)' }}>Совет карт</p>
            <p className="font-serif font-light leading-relaxed mx-auto max-w-md"
              style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
              {clean(reading.advice)}
            </p>
          </div>
        )}

        {/* Back */}
        <div className="text-center pt-4">
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/cabinet')}
            className="rounded-2xl px-8 py-3 font-sans text-sm font-medium"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            ← Вернуться в кабинет
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
