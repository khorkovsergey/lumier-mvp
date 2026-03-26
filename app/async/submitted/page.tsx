'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAppStore } from '@/shared/lib/store'
import { Button } from '@/shared/ui/Button'
import { pageIn, staggerNormal, revealHero, revealNormal } from '@/shared/animations/variants'
import Link from 'next/link'

export default function AsyncSubmittedPage() {
  const router = useRouter()
  const { reader } = useAppStore()
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600)
    const t2 = setTimeout(() => setStep(2), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const steps = [
    { label: 'Request received', done: step >= 0 },
    { label: 'Reading in progress', done: step >= 1 },
    { label: 'Response delivered', done: step >= 3 },
  ]

  return (
    <motion.div
      variants={pageIn}
      initial="hidden"
      animate="visible"
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ border: '1px solid rgba(196,150,74,0.3)', background: 'rgba(196,150,74,0.06)' }}
        >
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            className="text-3xl"
            style={{ color: 'var(--gold)' }}
          >
            ✦
          </motion.span>
        </motion.div>

        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="space-y-3 mb-10">
          <motion.h2 variants={revealHero} className="font-serif font-light" style={{ fontSize: '1.875rem', color: 'var(--text-primary)' }}>
            Your reading is underway
          </motion.h2>
          <motion.p variants={revealNormal} className="font-sans text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {reader.name?.split(' ')[0]} has received your question and will begin their reading shortly. You&apos;ll receive the full response within 24 hours.
          </motion.p>
        </motion.div>

        {/* Progress steps */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs space-y-3 mb-10"
        >
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <motion.div
                animate={{ background: s.done ? 'var(--gold)' : 'var(--border-subtle)' }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-sans text-xs font-medium"
                style={{ color: s.done ? '#FAF7F0' : 'var(--text-muted)' }}
              >
                {s.done ? '✓' : i + 1}
              </motion.div>
              <motion.p
                animate={{ color: s.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="font-sans text-sm"
              >
                {s.label}
              </motion.p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-xs space-y-3"
        >
          <Button onClick={() => router.push('/async/status')} fullWidth size="lg">
            Track my reading
          </Button>
          <Link
            href="/insights"
            className="block text-center font-sans text-sm transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            Browse insights while you wait
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
