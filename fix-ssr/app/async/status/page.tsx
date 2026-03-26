'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { getAsyncStatus, completeAsyncReading } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { Button } from '@/shared/ui/Button'
import { pageIn, staggerNormal, revealNormal, revealSubtle, dur, ease } from '@/shared/animations/variants'
import Link from 'next/link'

type StatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

const DEMO_RESULT = `**Your Reading: The Crossroads**

*Three cards were drawn for your question.*

---

**Position 1 — Where You Stand: The Eight of Pentacles**

You have built real competency in your current role. This card confirms what you likely already sense: you are not leaving because you have failed here. You have genuinely mastered something. The Eight of Pentacles asks you to honor that foundation before stepping forward.

---

**Position 2 — What You Are Moving Toward: The Fool**

The Fool is the card of genuine new beginnings. Its appearance suggests that the uncertainty you named is not a problem to solve before you proceed — it is the nature of the threshold itself.

What you are being invited into is not a clear path. It is a genuine opening.

---

**Position 3 — What This Transition Requires: The High Priestess**

The High Priestess asks you to listen more deeply to what you already know, before reaching for external validation. She asks: what do you know, in the part of you that doesn't need to be convinced?

---

**In Summary**

You have the foundation. The opportunity is real. What stands between you and stepping into it is not information — it is the permission you have not yet fully given yourself.`

const STAGE_COPY: Record<StatusType, { headline: string; sub: string; body: string }> = {
  PENDING: {
    headline: 'Your request has been received',
    sub: 'Awaiting your reader',
    body: 'Your question is in the hands of your reader. They will begin when ready to give it proper attention.',
  },
  IN_PROGRESS: {
    headline: 'Your reading is being written',
    sub: 'Reader is with your question',
    body: 'This is a considered process. Your reader is sitting with your question, drawing cards, and composing a response crafted specifically for you.',
  },
  COMPLETED: {
    headline: 'Your reading is ready',
    sub: 'Response complete',
    body: 'Your reader has completed your personal reading. Take your time with it.',
  },
}

export default function AsyncStatusPage() {
  const router = useRouter()
  const { session, reader } = useAppStore()
  const [status, setStatus] = useState<StatusType>('IN_PROGRESS')
  const [readingId, setReadingId] = useState<string | null>(null)
  const autoCompleted = useRef(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const checkStatus = useCallback(async () => {
    if (!session.id) return
    const reading = await getAsyncStatus(session.id)
    if (reading) {
      setReadingId(reading.id)
      setStatus(reading.status as StatusType)
      if (reading.status === 'COMPLETED' && pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [session.id])

  useEffect(() => {
    checkStatus()
    pollRef.current = setInterval(checkStatus, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [checkStatus])

  // Auto-complete after 18s for demo
  useEffect(() => {
    if (!readingId || status === 'COMPLETED' || autoCompleted.current) return
    const t = setTimeout(async () => {
      autoCompleted.current = true
      await completeAsyncReading(readingId, DEMO_RESULT)
      setStatus('COMPLETED')
    }, 18000)
    return () => clearTimeout(t)
  }, [readingId, status])

  const copy = STAGE_COPY[status]
  const stageIndex = status === 'PENDING' ? 0 : status === 'IN_PROGRESS' ? 1 : 2

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* Ambient gradient that intensifies with progress */}
      <motion.div
        animate={{ opacity: status === 'COMPLETED' ? 1 : 0.5 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(196,150,74,0.08), transparent)' }}
      />

      {/* Header */}
      <div className="relative px-6 pt-12 pb-8">
        <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
          Lumina
        </p>
        <div className="mt-1.5" style={{ height: 1, width: 24, background: 'var(--gold)' }} />
      </div>

      <div className="relative flex-1 px-6">
        {/* Status indicator + headline */}
        <AnimatePresence mode="wait">
          <motion.div key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: dur.normal, ease: ease.outSoft }}
            className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <StatusOrb status={status} />
              <p className="label-overline" style={{ color: 'var(--gold)' }}>{copy.sub}</p>
            </div>
            <h1 className="font-serif font-light mb-3"
              style={{ fontSize: '1.875rem', lineHeight: 1.15, color: 'var(--text-primary)' }}>
              {copy.headline}
            </h1>
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '32ch' }}>
              {copy.body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Three-stage progress */}
        <div className="mb-8">
          <StageProgress currentIndex={stageIndex} status={status} readerName={reader.name} />
        </div>

        {/* Reader context card */}
        <motion.div
          variants={revealNormal} initial="hidden" animate="visible"
          className="mb-6 rounded-xl p-5"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center font-serif text-sm"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}>
              {reader.name?.charAt(0) ?? 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{reader.name}</p>
              <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{reader.specialization}</p>
            </div>
            {status === 'IN_PROGRESS' && (
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ background: 'rgba(196,150,74,0.08)' }}>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--gold)' }}
                />
                <p className="font-sans text-xs" style={{ color: 'var(--gold)' }}>Writing</p>
              </div>
            )}
          </div>

          {/* Progress bar — only when in progress */}
          {status !== 'COMPLETED' && (
            <div className="mt-4">
              <ReadingProgressBar status={status} />
            </div>
          )}
        </motion.div>

        {/* Insight suggestion while waiting */}
        {status !== 'COMPLETED' && (
          <motion.div variants={revealSubtle} initial="hidden" animate="visible"
            transition={{ delay: 0.4 }} className="mb-4">
            <Link href="/insights">
              <div className="flex items-center justify-between rounded-xl px-5 py-4 transition-all"
                style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <p className="font-sans text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Read while you wait
                  </p>
                  <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Insights on practice and preparation
                  </p>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Demo shortcut */}
        {status === 'IN_PROGRESS' && readingId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5 }}>
            <button
              onClick={async () => {
                await completeAsyncReading(readingId, DEMO_RESULT)
                setStatus('COMPLETED')
              }}
              className="w-full rounded-xl py-3 font-sans text-xs transition-all"
              style={{ border: '1px dashed var(--border-default)', color: 'var(--text-muted)' }}>
              [Demo] Complete reading now
            </button>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="relative px-6 pb-10 pt-4 safe-bottom">
        <AnimatePresence>
          {status === 'COMPLETED' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.slow, ease: ease.outSoft }}>
              <Button onClick={() => router.push('/result')} fullWidth size="lg" variant="secondary">
                Open my reading →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusOrb({ status }: { status: StatusType }) {
  const colors: Record<StatusType, string> = {
    PENDING:     '#B5ADA4',
    IN_PROGRESS: 'var(--gold)',
    COMPLETED:   '#4ade80',
  }
  return (
    <div className="relative h-3 w-3">
      {status === 'IN_PROGRESS' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'var(--gold)' }}
          animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <div className="relative h-3 w-3 rounded-full" style={{ background: colors[status] }} />
    </div>
  )
}

function StageProgress({ currentIndex, status, readerName }: {
  currentIndex: number; status: StatusType; readerName: string | null
}) {
  const stages = [
    { label: 'Question received', detail: 'Delivered to your reader' },
    { label: 'Reading in progress', detail: `${readerName?.split(' ')[0] ?? 'Your reader'} is composing` },
    { label: 'Reading complete', detail: 'Ready to view' },
  ]

  return (
    <div className="space-y-px">
      {stages.map((stage, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: dur.normal, ease: ease.outSoft }}
            className="flex items-center gap-4 py-3.5"
          >
            {/* Node */}
            <div className="relative flex flex-col items-center" style={{ width: 32 }}>
              <motion.div
                animate={{
                  background: done ? 'var(--gold)' : active ? 'var(--text-primary)' : 'var(--bg-raised)',
                  borderColor: done || active ? 'transparent' : 'var(--border-default)',
                }}
                transition={{ duration: 0.5 }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border font-sans text-xs font-medium"
                style={{ color: done || active ? 'white' : 'var(--text-muted)' }}
              >
                {done ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                    ✓
                  </motion.span>
                ) : i + 1}
              </motion.div>
              {i < stages.length - 1 && (
                <div className="mt-1" style={{ width: 1, height: 16, background: done ? 'var(--gold-light)' : 'var(--border-subtle)' }} />
              )}
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="font-sans text-sm"
                style={{ color: active ? 'var(--text-primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: active ? 500 : 400 }}>
                {stage.label}
              </p>
              {(done || active) && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="font-sans text-xs mt-0.5"
                  style={{ color: 'var(--text-muted)' }}>
                  {stage.detail}
                </motion.p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function ReadingProgressBar({ status }: { status: StatusType }) {
  return (
    <div>
      <div className="overflow-hidden rounded-full" style={{ height: 3, background: 'var(--border-subtle)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(to right, var(--gold-light), var(--gold))' }}
          initial={{ width: '18%' }}
          animate={{ width: status === 'IN_PROGRESS' ? '72%' : '100%' }}
          transition={{ duration: 1.4, ease: ease.outSoft }}
        />
      </div>
      <p className="mt-1.5 font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
        {status === 'IN_PROGRESS' ? 'In progress' : 'Awaiting'}
      </p>
    </div>
  )
}
