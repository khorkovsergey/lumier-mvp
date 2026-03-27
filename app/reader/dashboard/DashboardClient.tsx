'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { logout } from '@/server/actions/auth'
import { acceptSession } from '@/server/actions/reader'
import { pageIn, staggerNormal, revealNormal, revealSubtle } from '@/shared/animations/variants'

const STATUS_LABELS = {
  PENDING:   { label: 'Новый',       color: 'var(--gold)',  bg: 'rgba(196,150,74,0.08)' },
  ACTIVE:    { label: 'В работе',    color: '#2563eb',      bg: '#eff6ff' },
  COMPLETED: { label: 'Завершён',    color: '#16a34a',      bg: '#f0fdf4' },
  CANCELLED: { label: 'Отменён',     color: '#ef4444',      bg: '#fef2f2' },
}

const TYPE_LABELS = { ASYNC: 'Письменный', LIVE: 'Живой чат' }

interface Session {
  id: string
  type: 'LIVE' | 'ASYNC'
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: Date | string
  user: { id: string; name: string; email: string | null }
  order: { amount: number; status: string } | null
  asyncReading: { status: string } | null
  messages: Array<{ content: string; senderType: string }>
  _count: { messages: number }
}

interface User {
  id: string
  name: string
  email: string | null
  role: string
}

export function DashboardClient({ user, sessions }: { user: User; sessions: Session[] }) {
  const router = useRouter()
  const [accepting, setAccepting] = useState<string | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL')

  const pending   = sessions.filter(s => s.status === 'PENDING')
  const active    = sessions.filter(s => s.status === 'ACTIVE')
  const completed = sessions.filter(s => s.status === 'COMPLETED')

  const filtered = filter === 'ALL' ? sessions
    : sessions.filter(s => s.status === filter)

  const totalEarned = sessions
    .filter(s => s.status === 'COMPLETED' && s.order?.status === 'PAID')
    .reduce((sum, s) => sum + (s.order?.amount ?? 0), 0)

  async function handleAccept(sessionId: string) {
    setAccepting(sessionId)
    try {
      await acceptSession(sessionId)
      router.push(`/reader/session/${sessionId}`)
    } finally {
      setAccepting(null)
    }
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Шапка */}
      <div className="glass sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-2xl flex items-center justify-between px-6 py-4">
          <div>
            <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              Lumier
            </p>
            <p className="label-overline" style={{ color: 'var(--gold)', fontSize: '0.6rem' }}>Кабинет консультанта</p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>{user.name}</p>
            <button onClick={async () => { await logout() }}
              className="font-sans text-xs transition-opacity hover:opacity-60"
              style={{ color: 'var(--text-muted)' }}>
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8 space-y-8">

        {/* Статистика */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible"
          className="grid grid-cols-3 gap-3">
          {[
            { label: 'Новых', value: pending.length, color: 'var(--gold)' },
            { label: 'В работе', value: active.length, color: '#2563eb' },
            { label: 'Заработано', value: `$${totalEarned}`, color: '#16a34a' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={revealNormal}
              className="rounded-xl px-4 py-4 text-center"
              style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
              <p className="font-serif text-2xl font-light" style={{ color: stat.color }}>{stat.value}</p>
              <p className="label-overline mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Новые запросы */}
        {pending.length > 0 && (
          <motion.div variants={staggerNormal} initial="hidden" animate="visible">
            <motion.div variants={revealSubtle} className="flex items-center gap-2 mb-3">
              <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Новые запросы</p>
              <span className="rounded-full px-2 py-0.5 font-sans text-xs font-medium"
                style={{ background: 'rgba(196,150,74,0.1)', color: 'var(--gold)' }}>
                {pending.length}
              </span>
            </motion.div>
            <div className="space-y-3">
              {pending.map(s => (
                <motion.div key={s.id} variants={revealNormal}>
                  <SessionRow
                    session={s}
                    onOpen={() => router.push(`/reader/session/${s.id}`)}
                    onAccept={() => handleAccept(s.id)}
                    accepting={accepting === s.id}
                    showAccept
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Фильтры + список */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-3">
            <motion.p variants={revealSubtle} className="label-overline" style={{ color: 'var(--text-muted)' }}>
              Все сессии
            </motion.p>
            <div className="flex gap-1.5">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="rounded-full px-3 py-1 font-sans text-xs transition-all"
                  style={filter === f
                    ? { background: 'var(--text-primary)', color: '#FAF7F0' }
                    : { background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }
                  }>
                  {f === 'ALL' ? 'Все' : f === 'ACTIVE' ? 'В работе' : 'Завершённые'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.filter(s => s.status !== 'PENDING').map(s => (
              <motion.div key={s.id} variants={revealNormal}>
                <SessionRow
                  session={s}
                  onOpen={() => router.push(`/reader/session/${s.id}`)}
                />
              </motion.div>
            ))}
            {filtered.filter(s => s.status !== 'PENDING').length === 0 && (
              <div className="py-10 text-center">
                <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>Нет сессий</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function SessionRow({
  session, onOpen, onAccept, accepting, showAccept,
}: {
  session: Session
  onOpen: () => void
  onAccept?: () => void
  accepting?: boolean
  showAccept?: boolean
}) {
  const st = STATUS_LABELS[session.status]
  const lastMsg = session.messages[0]

  return (
    <div className="rounded-xl p-4 transition-all"
      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0" onClick={onOpen} style={{ cursor: 'pointer' }}>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-serif text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              {session.user.name}
            </p>
            <span className="rounded-full px-2 py-0.5 font-sans text-[0.65rem] font-medium"
              style={{ background: st.bg, color: st.color }}>
              {st.label}
            </span>
            <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              {TYPE_LABELS[session.type]}
            </span>
          </div>
          {lastMsg && (
            <p className="font-sans text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {lastMsg.senderType === 'READER' ? 'Вы: ' : `${session.user.name.split(' ')[0]}: `}
              {lastMsg.content}
            </p>
          )}
          <p className="font-sans text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {new Date(session.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            {session.order && ` · $${session.order.amount}`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showAccept && onAccept && (
            <button onClick={onAccept} disabled={accepting}
              className="rounded-lg px-3 py-1.5 font-sans text-xs font-medium transition-all disabled:opacity-50"
              style={{ background: 'var(--gold)', color: 'white' }}>
              {accepting ? '...' : 'Принять'}
            </button>
          )}
          <button onClick={onOpen}
            className="rounded-lg px-3 py-1.5 font-sans text-xs transition-all"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            Открыть →
          </button>
        </div>
      </div>
    </div>
  )
}
