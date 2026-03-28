'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { logout } from '@/server/actions/auth'
import { pageIn, staggerNormal, revealNormal, revealSubtle } from '@/shared/animations/variants'
import Link from 'next/link'

const STATUS_LABELS = {
  PENDING:   { label: 'Ожидание',    color: 'var(--text-muted)',  bg: 'var(--bg-raised)' },
  ACTIVE:    { label: 'В процессе',  color: 'var(--gold)',        bg: 'rgba(212,149,74,0.10)' },
  COMPLETED: { label: 'Завершено',   color: '#4ADE80',            bg: 'rgba(74,222,128,0.10)' },
  CANCELLED: { label: 'Отменено',    color: '#F87171',            bg: 'rgba(248,113,113,0.10)' },
}

const TYPE_LABELS = {
  ASYNC: 'Письменный расклад',
  LIVE:  'Живая сессия',
}

interface Session {
  id: string
  type: 'LIVE' | 'ASYNC'
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: Date | string
  reader: { name: string; specialization: string; tier: string }
  order: { amount: number; status: string } | null
  asyncReading: { status: string; resultText: string | null; completedAt: Date | null } | null
  _count: { messages: number }
}

interface User {
  id: string
  name: string
  email: string | null
  role: string
}

interface TarotHistoryItem {
  id: string
  question: string
  category: string
  summary: string
  createdAt: Date | string
}

export function CabinetClient({ user, sessions, tarotHistory = [] }: { user: User; sessions: Session[]; tarotHistory?: TarotHistoryItem[] }) {
  const router = useRouter()

  const active   = sessions.filter(s => s.status === 'ACTIVE' || s.status === 'PENDING')
  const completed = sessions.filter(s => s.status === 'COMPLETED')

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Шапка */}
      <div className="glass sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-xl flex items-center justify-between px-6 py-4">
          <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Lumier
          </p>
          <div className="flex items-center gap-4">
            <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>{user.name}</p>
            <button
              onClick={async () => { await logout() }}
              className="font-sans text-xs transition-opacity hover:opacity-60"
              style={{ color: 'var(--text-muted)' }}>
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-6 py-8 space-y-8">

        {/* Приветствие */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible">
          <motion.p variants={revealSubtle} className="label-overline mb-2" style={{ color: 'var(--gold)' }}>
            Личный кабинет
          </motion.p>
          <motion.h1 variants={revealNormal} className="font-serif font-light"
            style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
            Добро пожаловать, {user.name.split(' ')[0]}
          </motion.h1>
        </motion.div>

        {/* Действия */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="space-y-3">
          {/* Консультация с экспертом */}
          <motion.div variants={revealNormal}>
            <Link href="/question">
              <div className="flex items-center justify-between rounded-xl px-5 py-4 transition-all cursor-pointer"
                style={{ background: 'var(--gold)', boxShadow: '0 0 24px rgba(212,149,74,0.20), 0 4px 16px rgba(0,0,0,0.35)' }}>
                <div>
                  <p className="font-serif text-lg font-medium" style={{ color: '#0E1520' }}>Консультация с экспертом</p>
                  <p className="font-sans text-xs mt-0.5" style={{ color: 'rgba(14,21,32,0.6)' }}>Живой разбор от специалиста</p>
                </div>
                <span style={{ color: '#0E1520', fontSize: '1.25rem' }}>⚜</span>
              </div>
            </Link>
          </motion.div>

          {/* AI Таро расклад */}
          <motion.div variants={revealNormal}>
            <Link href="/tarot">
              <div className="flex items-center justify-between rounded-xl px-5 py-4 transition-all cursor-pointer"
                style={{ background: 'var(--bg-float)', border: '1px solid rgba(212,149,74,0.20)', boxShadow: '0 0 16px rgba(212,149,74,0.06)' }}>
                <div>
                  <p className="font-serif text-lg font-medium" style={{ color: 'var(--gold)' }}>Расклад Таро с AI</p>
                  <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>AI-интерпретация от Lumier</p>
                </div>
                <span style={{ color: 'var(--gold)', fontSize: '1.25rem', opacity: 0.7 }}>◈</span>
              </div>
            </Link>
          </motion.div>

          {/* Новости и прогнозы */}
          <motion.div variants={revealNormal}>
            <Link href="/insights">
              <div className="flex items-center justify-between rounded-xl px-5 py-4 transition-all cursor-pointer"
                style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <p className="font-serif text-base font-medium" style={{ color: 'var(--text-primary)' }}>Новости и прогнозы</p>
                  <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>От экспертов Lumier</p>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>✧</span>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Активные сессии */}
        {active.length > 0 && (
          <motion.div variants={staggerNormal} initial="hidden" animate="visible">
            <motion.p variants={revealSubtle} className="label-overline mb-3" style={{ color: 'var(--text-muted)' }}>
              Активные сессии
            </motion.p>
            <div className="space-y-3">
              {active.map(s => (
                <motion.div key={s.id} variants={revealNormal}>
                  <SessionCard session={s} onClick={() => router.push(`/cabinet/session/${s.id}`)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Завершённые */}
        {completed.length > 0 && (
          <motion.div variants={staggerNormal} initial="hidden" animate="visible">
            <motion.p variants={revealSubtle} className="label-overline mb-3" style={{ color: 'var(--text-muted)' }}>
              История раскладов
            </motion.p>
            <div className="space-y-3">
              {completed.map(s => (
                <motion.div key={s.id} variants={revealNormal}>
                  <SessionCard session={s} onClick={() => router.push(`/cabinet/session/${s.id}`)} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* История AI-раскладов */}
        {tarotHistory.length > 0 && (
          <motion.div variants={staggerNormal} initial="hidden" animate="visible">
            <motion.div variants={revealSubtle} className="flex items-center justify-between mb-3">
              <p className="label-overline" style={{ color: 'var(--text-muted)' }}>
                История AI-раскладов
              </p>
              <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                Последние 10
              </span>
            </motion.div>

            <div className="space-y-2.5">
              {tarotHistory.map(r => (
                <motion.div key={r.id} variants={revealNormal}>
                  <Link href={`/cabinet/tarot/${r.id}`}>
                    <div className="rounded-xl px-4 py-3.5 transition-all cursor-pointer"
                      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {r.question}
                          </p>
                          {r.summary && (
                            <p className="font-sans text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                              {r.summary}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(r.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                          </p>
                          <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>◈</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.p variants={revealSubtle}
              className="font-sans text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
              Сохраняются только последние 10 раскладов
            </motion.p>
          </motion.div>
        )}

        {sessions.length === 0 && tarotHistory.length === 0 && (
          <motion.div variants={revealNormal} initial="hidden" animate="visible"
            className="py-16 text-center">
            <p className="font-serif text-xl font-light mb-2" style={{ color: 'var(--text-secondary)' }}>
              У вас пока нет раскладов
            </p>
            <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
              Начните с вашего первого вопроса
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
  const st = STATUS_LABELS[session.status]
  const hasResult = session.asyncReading?.status === 'COMPLETED' && session.asyncReading?.resultText

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className="cursor-pointer rounded-xl p-5 transition-all"
      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 16px rgba(0,0,0,0.35)' }}>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-serif text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              {session.reader.name}
            </p>
            <span className="rounded-full px-2 py-0.5 font-sans text-[0.65rem] font-medium"
              style={{ background: st.bg, color: st.color }}>
              {st.label}
            </span>
          </div>
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            {TYPE_LABELS[session.type]} · {session.reader.specialization}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          {session.order && (
            <p className="font-serif text-base font-light" style={{ color: 'var(--text-primary)' }}>
              ${session.order.amount}
            </p>
          )}
          <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {new Date(session.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {hasResult && (
        <div className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <span style={{ color: '#4ADE80' }} className="text-xs">✓</span>
          <p className="font-sans text-xs" style={{ color: '#4ADE80' }}>Расклад готов — нажмите для просмотра</p>
        </div>
      )}
    </motion.div>
  )
}
