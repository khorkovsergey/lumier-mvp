'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/shared/lib/store'
import { useFlowStore } from '@/features/flow/useFlow'
import { Button } from '@/shared/ui/Button'
import { staggerNormal, revealNormal, stickyBar, dur, ease } from '@/shared/animations/variants'
import { cn } from '@/shared/lib/utils'

interface Reader {
  id: string
  name: string
  specialization: string
  tier: 'FOUNDATION' | 'SENIOR' | 'MASTER'
  price: number
  rating: number
  bio: string
}

const TIER_ORDER = { MASTER: 0, SENIOR: 1, FOUNDATION: 2 }
const FILTERS = ['Все', 'Foundation', 'Senior', 'Master'] as const
type Filter = typeof FILTERS[number]

const TIER_FILTER_MAP: Record<Filter, string> = {
  'Все': 'All',
  'Foundation': 'FOUNDATION',
  'Senior': 'SENIOR',
  'Master': 'MASTER',
}

function findRecommended(readers: Reader[]): string | null {
  return readers.find((r) => r.tier === 'MASTER')?.id ?? readers[0]?.id ?? null
}

export function ReadersClient({ readers }: { readers: Reader[] }) {
  const router = useRouter()
  const { user, question, reader: selectedReader, setReader, setSession } = useAppStore()
  const { markComplete } = useFlowStore()
  const [filter, setFilter] = useState<Filter>('Все')
  const recommended = findRecommended(readers)

  const filterValue = TIER_FILTER_MAP[filter]
  const filtered = readers
    .filter((r) => filterValue === 'All' || r.tier === filterValue)
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier])

  function handleSelect(r: Reader) {
    setReader({ id: r.id, name: r.name, specialization: r.specialization, price: r.price, tier: r.tier })
  }

  async function handleContinue() {
    if (!selectedReader.id || !user.id) return
    setLoading(true)
    try {
      const { createSession, activateSession } = await import('@/server/actions')
      const result = await createSession({ userId: user.id, readerId: selectedReader.id, type: 'LIVE' })
      if (result.success) {
        await activateSession(result.session.id)
        setSession({ id: result.session.id, orderId: null, type: 'LIVE' })
        markComplete('readers')
        markComplete('checkout')
        markComplete('session-format')
        router.push(`/chat/${result.session.id}`)
      }
    } catch {
      setError('Ошибка при создании сессии')
    } finally {
      setLoading(false)
    }
  }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Шапка */}
      <div className="px-6 pt-12 pb-5">
        <motion.button
          onClick={() => router.back()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-1.5 label-overline transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}
          whileTap={{ scale: 0.97 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Назад
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.slow, ease: ease.outSoft }}
        >
          <h1 className="font-serif font-light" style={{ fontSize: '2rem', lineHeight: 1.15, color: 'var(--text-primary)' }}>
            Выберите своего проводника
          </h1>
          {question.category && (
            <p className="mt-1.5 font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
              По вопросам о{' '}
              <span style={{ color: 'var(--text-secondary)' }} className="capitalize">
                {question.category}
              </span>
            </p>
          )}
        </motion.div>

        {/* Фильтры */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: dur.normal }}
          className="mt-5 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none"
        >
          {FILTERS.map((f) => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all"
              style={
                filter === f
                  ? { background: 'var(--text-primary)', color: '#FAF7F0' }
                  : { background: 'var(--bg-float)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }
              }
            >
              {f}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Список читателей */}
      <motion.div
        variants={staggerNormal}
        initial="hidden"
        animate="visible"
        className="flex-1 space-y-3 px-6 pb-36"
      >
        {filtered.map((r) => (
          <motion.div key={r.id} variants={revealNormal}>
            <ReaderCard
              reader={r}
              isSelected={selectedReader.id === r.id}
              isRecommended={r.id === recommended && filter === 'Все'}
              onSelect={() => handleSelect(r)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Кнопка выбора */}
      <AnimatePresence>
        {selectedReader.id && (
          <motion.div
            variants={stickyBar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-20"
          >
            <div className="glass border-t safe-bottom px-6 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Выбранный проводник</p>
                  <p className="font-serif text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {selectedReader.name}
                  </p>
                </div>
                <p className="font-serif text-xl font-light" style={{ color: 'var(--text-primary)' }}>
                  ${selectedReader.price}
                </p>
              </div>
              {error && <p className="font-sans text-xs text-center mb-2" style={{ color: '#F87171' }}>{error}</p>}
              <Button onClick={handleContinue} fullWidth size="lg" loading={loading}>
                Начать консультацию
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const TIER_META = {
  FOUNDATION: { label: 'Foundation', color: 'var(--text-muted)', bg: 'var(--bg-raised)' },
  SENIOR:     { label: 'Senior',     color: '#92713A',           bg: '#FBF5EA' },
  MASTER:     { label: 'Master',     color: 'var(--gold)',       bg: 'rgba(196,150,74,0.08)' },
}

function ReaderCard({
  reader, isSelected, isRecommended, onSelect,
}: {
  reader: Reader
  isSelected: boolean
  isRecommended: boolean
  onSelect: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = TIER_META[reader.tier]

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-float)',
    border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border-subtle)'}`,
    boxShadow: isSelected
      ? '0 4px 24px rgba(196,150,74,0.16), 0 1px 4px rgba(196,150,74,0.1)'
      : '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: isSelected ? 0 : -2 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="relative cursor-pointer overflow-hidden rounded-xl"
      style={cardStyle}
    >
      {/* Рекомендованный */}
      {isRecommended && !isSelected && (
        <div className="absolute right-0 top-0">
          <div
            className="rounded-bl-lg px-3 py-1"
            style={{
              background: 'rgba(196,150,74,0.1)',
              borderBottom: '1px solid rgba(196,150,74,0.2)',
              borderLeft: '1px solid rgba(196,150,74,0.2)',
            }}
          >
            <p className="label-overline" style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>
              Рекомендован
            </p>
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl font-serif text-xl font-light"
            style={{ background: isSelected ? 'rgba(196,150,74,0.12)' : meta.bg, color: isSelected ? 'var(--gold)' : meta.color }}
          >
            {reader.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-medium" style={{ fontSize: '1.125rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {reader.name}
              </h3>
              <span
                className="rounded-full px-2 py-0.5 font-sans font-medium"
                style={{ fontSize: '0.65rem', background: meta.bg, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            <p className="mt-1 font-sans text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
              {reader.specialization}
            </p>
          </div>

          <div className="flex-shrink-0 text-right pt-0.5">
            <p className="font-serif text-xl font-light" style={{ color: 'var(--text-primary)' }}>
              ${reader.price}
            </p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span style={{ color: 'var(--gold)', fontSize: 10 }}>★</span>
              <span className="font-sans text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {reader.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pl-[4.5rem]">
          <p
            className={cn('font-sans text-sm leading-relaxed', !expanded && 'line-clamp-2')}
            style={{ color: 'var(--text-secondary)' }}
          >
            {reader.bio}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="mt-1.5 font-sans text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            {expanded ? 'Свернуть ↑' : 'Подробнее ↓'}
          </button>
        </div>

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-lg px-4 py-2.5 flex items-center gap-2"
                style={{ background: 'rgba(196,150,74,0.08)', border: '1px solid rgba(196,150,74,0.2)' }}
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                  style={{ color: 'var(--gold)' }}
                  className="text-xs"
                >
                  ✓
                </motion.span>
                <p className="font-sans text-xs" style={{ color: 'var(--gold)' }}>
                  {reader.name.split(' ')[0]} выбран — продолжите ниже
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
