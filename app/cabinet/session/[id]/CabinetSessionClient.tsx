'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageIn, staggerNormal, revealNormal, revealSubtle } from '@/shared/animations/variants'
import Link from 'next/link'

interface Message {
  id: string
  senderType: 'USER' | 'READER'
  content: string
  type: 'TEXT' | 'READING_DRAFT' | 'READING_PUBLISHED'
  createdAt: Date | string
}

interface Session {
  id: string
  type: 'LIVE' | 'ASYNC'
  status: string
  createdAt: Date | string
  reader: { name: string; specialization: string; tier: string; bio: string }
  order: { amount: number; status: string } | null
  asyncReading: { status: string; resultText: string | null; completedAt: Date | null } | null
  messages: Message[]
}

const TIER_LABELS: Record<string, string> = {
  FOUNDATION: 'Foundation',
  SENIOR: 'Senior',
  MASTER: 'Master',
}

export function CabinetSessionClient({
  session, userName,
}: { session: Session; userName: string }) {
  const router = useRouter()
  const publishedReading = session.messages.find(m => m.type === 'READING_PUBLISHED')
  const hasResult = session.asyncReading?.status === 'COMPLETED' && session.asyncReading?.resultText

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Шапка */}
      <div className="glass sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-xl flex items-center justify-between px-6 py-4">
          <button onClick={() => router.push('/cabinet')}
            className="font-sans text-xs transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}>
            ← Кабинет
          </button>
          <p className="font-serif text-base font-light" style={{ color: 'var(--text-primary)' }}>Lumier</p>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-6 py-8 space-y-6">

        {/* Информация о сессии */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible">
          <motion.p variants={revealSubtle} className="label-overline mb-3" style={{ color: 'var(--text-muted)' }}>
            Детали сессии
          </motion.p>
          <motion.div variants={revealNormal} className="rounded-xl p-5"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-serif text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                  {session.reader.name}
                </p>
                <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {TIER_LABELS[session.reader.tier]} · {session.reader.specialization}
                </p>
              </div>
              {session.order && (
                <p className="font-serif text-xl font-light flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                  ${session.order.amount}
                </p>
              )}
            </div>
            <div className="mt-4 pt-4 flex items-center gap-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <p className="label-overline mb-0.5" style={{ color: 'var(--text-muted)' }}>Тип</p>
                <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {session.type === 'ASYNC' ? 'Письменный расклад' : 'Живая сессия'}
                </p>
              </div>
              <div>
                <p className="label-overline mb-0.5" style={{ color: 'var(--text-muted)' }}>Статус</p>
                <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {session.status === 'PENDING' ? 'Ожидание' :
                   session.status === 'ACTIVE' ? 'В процессе' :
                   session.status === 'COMPLETED' ? 'Завершено' : 'Отменено'}
                </p>
              </div>
              <div>
                <p className="label-overline mb-0.5" style={{ color: 'var(--text-muted)' }}>Дата</p>
                <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(session.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Готовый расклад */}
        {hasResult && (
          <motion.div variants={revealNormal} initial="hidden" animate="visible">
            <p className="label-overline mb-3" style={{ color: 'var(--text-muted)' }}>Ваш расклад</p>
            <div className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(196,150,74,0.3)', background: 'rgba(196,150,74,0.03)' }}>
              <div className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: '1px solid rgba(196,150,74,0.15)', background: 'rgba(196,150,74,0.06)' }}>
                <span style={{ color: 'var(--gold)' }}>✦</span>
                <p className="font-sans text-sm font-medium" style={{ color: 'var(--gold)' }}>Расклад готов</p>
              </div>
              <div className="px-5 py-5">
                <p className="font-sans text-sm leading-relaxed line-clamp-4" style={{ color: 'var(--text-secondary)' }}>
                  {session.asyncReading!.resultText!.slice(0, 300)}…
                </p>
                <Link href="/result">
                  <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl py-3 cursor-pointer"
                    style={{ background: 'var(--gold)', color: 'white' }}>
                    <p className="font-sans text-sm font-medium">Открыть полный расклад</p>
                    <span>→</span>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Переписка */}
        {session.messages.filter(m => m.type !== 'READING_PUBLISHED').length > 0 && (
          <motion.div variants={staggerNormal} initial="hidden" animate="visible">
            <motion.p variants={revealSubtle} className="label-overline mb-3" style={{ color: 'var(--text-muted)' }}>
              Переписка
            </motion.p>
            <div className="space-y-3">
              {session.messages
                .filter(m => m.type !== 'READING_PUBLISHED')
                .map(msg => (
                  <motion.div key={msg.id} variants={revealNormal}
                    className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.senderType === 'USER' ? 'rounded-br-sm' : 'rounded-bl-sm'
                    }`}
                      style={msg.senderType === 'USER'
                        ? { background: 'var(--text-primary)', color: 'var(--bg-raised)' }
                        : { background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }
                      }>
                      {msg.senderType === 'READER' && (
                        <p className="font-sans text-[0.65rem] mb-1" style={{ color: 'var(--text-muted)' }}>
                          {session.reader.name.split(' ')[0]}
                        </p>
                      )}
                      <p className="font-sans text-sm leading-relaxed">{msg.content}</p>
                      <p className="font-sans text-[0.6rem] mt-1 opacity-50">
                        {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Статус ожидания */}
        {session.status === 'ACTIVE' && !hasResult && (
          <motion.div variants={revealNormal} initial="hidden" animate="visible"
            className="rounded-xl px-5 py-4 text-center"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 rounded-full border-2 mx-auto mb-3"
              style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}
            />
            <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
              Консультант работает над вашим раскладом
            </p>
            <p className="font-sans text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Ответ будет готов в течение 24 часов
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
