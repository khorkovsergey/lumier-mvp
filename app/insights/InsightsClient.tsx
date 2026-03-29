'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition, staggerNormal, revealNormal, revealSubtle } from '@/shared/animations/variants'
import { toggleReaction } from '@/server/actions/forecasts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Weekly { id: string; title: string; content: string; tone: string; weekStart: string | Date; likes: number; dislikes: number }
interface Global { id: string; title: string; content: string; category: string; likes: number; dislikes: number; createdAt: string | Date }
interface CalEvent { id: string; title: string; description: string; eventDate: string | Date; forecast: string | null }
interface Breaking { id: string; title: string; content: string; urgency: string; likes: number; dislikes: number; createdAt: string | Date }
interface AiF { id: string; title: string; prediction: string; basis: string; likes: number; dislikes: number; createdAt: string | Date }
interface Accuracy { items: { id: string; prediction: string; outcome: string; accurate: boolean; predictedAt: string | Date; resolvedAt: string | Date | null }[]; percentage: number; total: number }
interface Article { id: string; title: string; preview: string; category: string; readTime: number; createdAt: string | Date }
interface UserReaction { targetId: string; targetType: string; type: string }

interface Props {
  weekly: Weekly | null
  globals: Global[]
  calendar: CalEvent[]
  breaking: Breaking[]
  ai: AiF[]
  accuracy: Accuracy
  articles: Article[]
  reactions: UserReaction[]
}

const GLOBAL_CATS: Record<string, string> = {
  politics: 'Политика', economy: 'Экономика', technology: 'Технологии', society: 'Общество',
}

const URGENCY_COLORS: Record<string, string> = {
  high: '#F87171', medium: 'var(--gold)', low: 'var(--text-muted)',
}

// ─── Reaction Button ──────────────────────────────────────────────────────────

function ReactionButtons({ targetId, targetType, likes, dislikes, userReaction }: {
  targetId: string; targetType: string; likes: number; dislikes: number; userReaction?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [localLikes, setLocalLikes] = useState(likes)
  const [localDislikes, setLocalDislikes] = useState(dislikes)
  const [localReaction, setLocalReaction] = useState(userReaction)

  function handleReact(type: 'like' | 'dislike') {
    startTransition(async () => {
      const prev = localReaction
      if (prev === type) {
        setLocalReaction(undefined)
        type === 'like' ? setLocalLikes(l => l - 1) : setLocalDislikes(d => d - 1)
      } else {
        if (prev === 'like') setLocalLikes(l => l - 1)
        if (prev === 'dislike') setLocalDislikes(d => d - 1)
        setLocalReaction(type)
        type === 'like' ? setLocalLikes(l => l + 1) : setLocalDislikes(d => d + 1)
      }
      await toggleReaction(targetId, targetType, type)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={() => handleReact('like')} disabled={isPending}
        className="flex items-center gap-1 font-sans text-xs transition-opacity hover:opacity-70"
        style={{ color: localReaction === 'like' ? 'var(--gold)' : 'var(--text-muted)' }}>
        ▲ {localLikes}
      </button>
      <button onClick={() => handleReact('dislike')} disabled={isPending}
        className="flex items-center gap-1 font-sans text-xs transition-opacity hover:opacity-70"
        style={{ color: localReaction === 'dislike' ? '#F87171' : 'var(--text-muted)' }}>
        ▼ {localDislikes}
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function InsightsClient({ weekly, globals, calendar, breaking, ai, accuracy, articles, reactions }: Props) {
  const router = useRouter()
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  function getUserReaction(targetId: string, targetType: string) {
    return reactions.find(r => r.targetId === targetId && r.targetType === targetType)?.type
  }

  const hasContent = weekly || globals.length > 0 || breaking.length > 0 || ai.length > 0 || calendar.length > 0 || articles.length > 0

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <div className="glass sticky top-0 z-20" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-xl md:max-w-4xl px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
            ← Назад
          </button>
          <p className="font-serif text-base font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>Lumier</p>
        </div>
      </div>

      <div className="mx-auto max-w-xl md:max-w-4xl px-6 pb-16">

        {/* Title */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="pt-10 pb-8 space-y-3">
          <motion.p variants={revealSubtle} className="label-overline" style={{ color: 'var(--gold)' }}>Lumier Intelligence</motion.p>
          <motion.h1 variants={revealNormal} className="font-serif font-light" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}>
            Новости и прогнозы <span style={{ color: 'var(--gold)' }}>событий</span>
          </motion.h1>
        </motion.div>

        {/* ═══ 1. BREAKING INSIGHTS ═══ */}
        {breaking.length > 0 && (
          <Section label="Срочные сигналы" icon="⚡">
            <div className="space-y-2">
              {breaking.map(b => (
                <motion.div key={b.id} variants={revealNormal}
                  className="rounded-xl px-4 py-3 flex items-start justify-between gap-3"
                  style={{ background: 'var(--bg-float)', borderLeft: `3px solid ${URGENCY_COLORS[b.urgency]}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{b.title}</p>
                    <p className="font-sans text-xs leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>{b.content}</p>
                  </div>
                  <ReactionButtons targetId={b.id} targetType="breaking" likes={b.likes} dislikes={b.dislikes}
                    userReaction={getUserReaction(b.id, 'breaking')} />
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ 2. WEEKLY INSIGHT ═══ */}
        {weekly && (
          <Section label="Прогноз на неделю" icon="◈">
            <div className="rounded-2xl p-5 md:p-6" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full px-3 py-1 font-sans text-xs font-medium"
                  style={{ background: 'rgba(212,149,74,0.12)', color: 'var(--gold)' }}>
                  {weekly.tone}
                </span>
                <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(weekly.weekStart).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h3 className="font-serif text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{weekly.title}</h3>
              <p className="font-sans text-sm md:text-base leading-[1.8] mb-4" style={{ color: 'var(--text-secondary)' }}>{weekly.content}</p>
              <ReactionButtons targetId={weekly.id} targetType="weekly" likes={weekly.likes} dislikes={weekly.dislikes}
                userReaction={getUserReaction(weekly.id, 'weekly')} />
            </div>
          </Section>
        )}

        {/* ═══ 3. GLOBAL FORECASTS ═══ */}
        {globals.length > 0 && (
          <Section label="Глобальные прогнозы" icon="⚜">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
              {globals.map(g => (
                <div key={g.id} className="flex-shrink-0 w-64 md:w-72 rounded-xl p-4"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                  <span className="font-sans text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                    {GLOBAL_CATS[g.category] || g.category}
                  </span>
                  <h4 className="font-serif text-sm font-medium mt-1.5 mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{g.title}</h4>
                  <p className="font-sans text-xs leading-[1.6] mb-3 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{g.content}</p>
                  <ReactionButtons targetId={g.id} targetType="global" likes={g.likes} dislikes={g.dislikes}
                    userReaction={getUserReaction(g.id, 'global')} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ 4. CALENDAR ═══ */}
        {calendar.length > 0 && (
          <Section label="Календарь событий" icon="✦">
            <div className="space-y-2">
              {calendar.map(ev => {
                const isOpen = expandedEvent === ev.id
                return (
                  <div key={ev.id} className="rounded-xl overflow-hidden"
                    style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                    <button onClick={() => setExpandedEvent(isOpen ? null : ev.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <div className="text-center flex-shrink-0 w-10">
                          <p className="font-serif text-lg font-light leading-none" style={{ color: 'var(--gold)' }}>
                            {new Date(ev.eventDate).getDate()}
                          </p>
                          <p className="font-sans text-[0.5rem] uppercase" style={{ color: 'var(--text-muted)' }}>
                            {new Date(ev.eventDate).toLocaleDateString('ru-RU', { month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <p className="font-serif text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ev.title}</p>
                          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{ev.description}</p>
                        </div>
                      </div>
                      <span className="font-sans text-xs" style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>▾</span>
                    </button>
                    {isOpen && ev.forecast && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        className="px-4 pb-4">
                        <div className="gold-rule mb-3" />
                        <p className="font-sans text-sm leading-[1.7]" style={{ color: 'var(--text-secondary)' }}>{ev.forecast}</p>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* ═══ 5. AI FORECASTS ═══ */}
        {ai.length > 0 && (
          <Section label="AI-прогнозы" icon="◇">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ai.map(a => (
                <div key={a.id} className="rounded-xl p-4"
                  style={{ background: 'var(--bg-float)', border: '1px solid rgba(212,149,74,0.12)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full px-2 py-0.5 font-sans text-[0.55rem] uppercase tracking-wider"
                      style={{ background: 'rgba(212,149,74,0.10)', color: 'var(--gold)' }}>
                      AI прогноз
                    </span>
                  </div>
                  <h4 className="font-serif text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{a.title}</h4>
                  <p className="font-sans text-xs leading-[1.6] mb-2" style={{ color: 'var(--text-secondary)' }}>{a.prediction}</p>
                  <p className="font-sans text-[0.65rem] mb-3" style={{ color: 'var(--text-muted)' }}>На основе: {a.basis}</p>
                  <ReactionButtons targetId={a.id} targetType="ai" likes={a.likes} dislikes={a.dislikes}
                    userReaction={getUserReaction(a.id, 'ai')} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ 6. ACCURACY ═══ */}
        {accuracy.total > 0 && (
          <Section label="Точность прогнозов" icon="◎">
            <div className="rounded-2xl p-5 md:p-6 text-center mb-4"
              style={{ background: 'var(--bg-float)', border: '1px solid rgba(212,149,74,0.15)' }}>
              <p className="font-serif font-light" style={{ fontSize: '3rem', color: 'var(--gold)' }}>{accuracy.percentage}%</p>
              <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>сбывшихся прогнозов из {accuracy.total}</p>
            </div>
            <div className="space-y-2">
              {accuracy.items.filter(a => a.resolvedAt).map(a => (
                <div key={a.id} className="rounded-xl px-4 py-3 flex items-start gap-3"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                  <span className="mt-0.5 flex-shrink-0" style={{ color: a.accurate ? '#4ADE80' : '#F87171', fontSize: '0.8rem' }}>
                    {a.accurate ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="font-sans text-xs font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>Предсказано: {a.prediction}</p>
                    <p className="font-sans text-xs" style={{ color: a.accurate ? '#4ADE80' : 'var(--text-muted)' }}>Результат: {a.outcome}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ═══ 7. ARTICLES ═══ */}
        {articles.length > 0 && (
          <Section label="Статьи экспертов" icon="✧">
            <div className="space-y-2">
              {articles.map(a => (
                <motion.div key={a.id} variants={revealNormal}
                  onClick={() => router.push(`/insights/${a.id}`)}
                  className="cursor-pointer rounded-xl px-4 py-3 transition-all hover:translate-y-[-1px]"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                      <p className="font-sans text-xs line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{a.preview}</p>
                    </div>
                    <span className="font-sans text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{a.readTime}м →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {!hasContent && (
          <div className="py-20 text-center">
            <p className="font-serif text-xl font-light" style={{ color: 'var(--text-muted)' }}>Контент появится скоро</p>
            <p className="font-sans text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Загляните позже</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="mb-10">
      <motion.div variants={revealSubtle} className="flex items-center gap-2 mb-4">
        <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>{icon}</span>
        <p className="label-overline" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </motion.div>
      {children}
    </motion.div>
  )
}

// Re-export for InsightDetailClient
export const ARTICLE_CATEGORIES: Record<string, string> = {
  forecast: 'Прогнозы', astrology: 'Астрология', tarot: 'Таро',
  numerology: 'Нумерология', practice: 'Практика', guide: 'Руководство',
  insight: 'Откровение', general: 'Общее',
}
