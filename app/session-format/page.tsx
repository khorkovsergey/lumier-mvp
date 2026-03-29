'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { updateSessionType, activateSession, createAsyncReading } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { useFlowStore } from '@/features/flow/useFlow'
import { Button } from '@/shared/ui/Button'
import { pageIn, staggerNormal, revealNormal, stickyBar } from '@/shared/animations/variants'
import { cn } from '@/shared/lib/utils'

const FORMATS = [
  {
    id: 'ASYNC' as const,
    label: 'Письменный расклад',
    tag: 'В течение 24 часов',
    description: 'Ваш Консультант медитирует над вашим вопросом, тянет карты и составляет развёрнутый письменный ответ.',
    features: ['Развёрнутый письменный ответ', 'Готов в течение 24 часов', 'Постоянный доступ к тексту'],
    symbol: '✦',
  },
  {
    id: 'LIVE' as const,
    label: 'Живой чат',
    tag: '45-минутная сессия',
    description: 'Общение с консультантом в реальном времени. Задавайте уточняющие вопросы и исследуйте темы по мере их возникновения.',
    features: ['Разговор в реальном времени', 'Уточняющие вопросы приветствуются', 'Стенограмма сессии'],
    symbol: '◈',
  },
]

export default function SessionFormatPage() {
  const router = useRouter()
  const { session, reader, setSession } = useAppStore()
  const { markComplete } = useFlowStore()
  const [selected, setSelected] = useState<'LIVE' | 'ASYNC' | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    if (!selected || !session.id) return
    setLoading(true)
    try {
      await updateSessionType(session.id, selected)
      await activateSession(session.id)
      setSession({ type: selected })
      markComplete('session-format')
      if (selected === 'ASYNC') {
        await createAsyncReading(session.id)
        router.push('/async/submitted')
      } else {
        router.push('/chat')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>

      <div className="px-5 pt-14 pb-6">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="font-sans text-[11px] uppercase tracking-widest mb-5"
          style={{ color: '#16a34a' }}>
          ✓ Оплата подтверждена
        </motion.p>
        <h2 className="font-serif font-light leading-snug" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
          Как вы хотите<br />получить расклад?
        </h2>
        <p className="mt-2 font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
          Оба формата доступны с {reader.name?.split(' ')[0]}.
        </p>
      </div>

      <motion.div variants={staggerNormal} initial="hidden" animate="visible"
        className="flex-1 px-5 pb-36 space-y-3">
        {FORMATS.map((fmt) => (
          <motion.div key={fmt.id} variants={revealNormal}>
            <motion.div onClick={() => setSelected(fmt.id)} whileTap={{ scale: 0.995 }}
              className="cursor-pointer rounded-2xl bg-white p-6 transition-all duration-200"
              style={{
                border: `1px solid ${selected === fmt.id ? 'var(--gold)' : 'var(--border-subtle)'}`,
                boxShadow: selected === fmt.id ? '0 4px 20px rgba(196,150,74,0.1)' : 'none',
              }}>
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5 transition-colors"
                  style={{ color: selected === fmt.id ? 'var(--gold)' : 'var(--border-default)' }}>
                  {fmt.symbol}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-serif font-medium" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      {fmt.label}
                    </h3>
                    <span className="font-sans text-xs" style={{ color: 'var(--gold)' }}>{fmt.tag}</span>
                  </div>
                  <p className="mt-2 font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {fmt.description}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {fmt.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--gold)' }}>·</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div variants={stickyBar} initial="hidden" animate="visible" exit="exit"
            className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/95 backdrop-blur-md px-5 pb-8 pt-4 safe-bottom"
            style={{ borderColor: 'var(--border-subtle)' }}>
            <Button onClick={handleContinue} loading={loading} fullWidth size="lg">
              Начать {selected === 'ASYNC' ? 'письменный расклад' : 'живую сессию'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
