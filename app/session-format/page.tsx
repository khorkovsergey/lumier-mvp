'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { updateSessionType, activateSession, createAsyncReading } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { useFlowStore } from '@/features/flow/useFlow'
import { Button } from '@/shared/ui/Button'
import { pageTransition, staggerContainer, staggerItem, stickyBar } from '@/shared/animations/variants'
import { cn } from '@/shared/lib/utils'

const FORMATS = [
  {
    id: 'ASYNC' as const,
    label: 'Written Reading',
    tag: 'Within 24 hours',
    description: 'Your reader takes time to meditate on your question, draw cards, and craft a comprehensive written response.',
    features: ['Comprehensive written response', 'Available within 24 hours', 'Permanent record'],
    symbol: '✦',
  },
  {
    id: 'LIVE' as const,
    label: 'Live Chat',
    tag: '45-minute session',
    description: 'A real-time conversation with your reader. Ask follow-up questions and explore threads as they emerge.',
    features: ['Real-time conversation', 'Follow-up questions welcome', 'Session transcript'],
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
      // Update DB session type (fixes the audit bug — checkout created ASYNC by default)
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
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col bg-ivory-50">

      <div className="px-5 pt-14 pb-6">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="font-sans text-[11px] uppercase tracking-widest text-emerald-600 mb-5">
          ✓ Payment confirmed
        </motion.p>
        <h2 className="font-serif text-[2rem] font-light leading-snug text-stone-800">
          How would you like<br />to receive your reading?
        </h2>
        <p className="mt-2 font-sans text-sm text-stone-400">
          Both formats are with {reader.name?.split(' ')[0]}.
        </p>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="flex-1 px-5 pb-36 space-y-3">
        {FORMATS.map((fmt) => (
          <motion.div key={fmt.id} variants={staggerItem}>
            <motion.div onClick={() => setSelected(fmt.id)} whileTap={{ scale: 0.995 }}
              className={cn(
                'cursor-pointer rounded-2xl border bg-white p-6 transition-all duration-200',
                selected === fmt.id
                  ? 'border-gold-400 ring-1 ring-gold-300/50 shadow-[0_4px_20px_rgba(196,163,90,0.1)]'
                  : 'border-stone-100 hover:border-stone-200 hover:shadow-sm'
              )}>
              <div className="flex items-start gap-4">
                <span className={cn(
                  'text-2xl mt-0.5 transition-colors',
                  selected === fmt.id ? 'text-gold-500' : 'text-stone-300'
                )}>
                  {fmt.symbol}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-serif text-xl font-medium text-stone-800">{fmt.label}</h3>
                    <span className="font-sans text-xs text-gold-500">{fmt.tag}</span>
                  </div>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-stone-500">{fmt.description}</p>
                  <ul className="mt-3 space-y-1">
                    {fmt.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 font-sans text-xs text-stone-400">
                        <span className="text-gold-400">·</span> {f}
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
            className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-100 bg-white/95 backdrop-blur-md px-5 pb-8 pt-4 safe-bottom">
            <Button onClick={handleContinue} loading={loading} fullWidth size="lg">
              Begin my {selected === 'ASYNC' ? 'written reading' : 'live session'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
