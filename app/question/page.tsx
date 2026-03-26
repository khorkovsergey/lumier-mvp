'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createQuestion } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { useFlowStore } from '@/features/flow/useFlow'
import { Button } from '@/shared/ui/Button'
import { Textarea } from '@/shared/ui/Input'
import { pageIn, staggerNormal, revealHero, revealNormal, revealSubtle } from '@/shared/animations/variants'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'relationships', label: 'Relationships' },
  { id: 'career',        label: 'Career' },
  { id: 'spiritual',     label: 'Spiritual' },
  { id: 'general',       label: 'General' },
  { id: 'health',        label: 'Health' },
  { id: 'finance',       label: 'Finance' },
]

const PROMPTS = [
  'I am facing a decision about…',
  'Something I cannot seem to resolve is…',
  'I want to understand why…',
  'I am uncertain whether…',
]

export default function QuestionPage() {
  const router = useRouter()
  const { user, setQuestion } = useAppStore()
  const { markComplete } = useFlowStore()
  const [text, setText] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const MAX = 1000

  useEffect(() => {
    if (!user.id) {
      router.replace('/onboarding')
    } else {
      setReady(true)
    }
  }, [user.id, router])

  if (!ready) return null

  async function handleSubmit() {
    if (text.trim().length < 10) { setError('Please describe your question in a bit more detail.'); return }
    if (!category) { setError('Please select a category.'); return }
    setError('')
    setLoading(true)
    try {
      const result = await createQuestion({ userId: user.id!, text: text.trim(), category })
      if (result.success) {
        setQuestion({ id: result.question.id, text: text.trim(), category })
        markComplete('question')
        router.push('/readers')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>

      <div className="flex items-center justify-between px-5 pt-14">
        <p className="font-serif text-xl font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>Lumina</p>
        <Link href="/insights" className="label-overline transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
          Insights
        </Link>
      </div>

      <motion.div variants={staggerNormal} initial="hidden" animate="visible"
        className="flex flex-1 flex-col px-5 pt-8">

        <motion.div variants={revealHero} className="space-y-2 mb-8">
          <h2 className="font-serif font-light" style={{ fontSize: '2rem', lineHeight: 1.15, color: 'var(--text-primary)' }}>
            What would you like<br />to explore?
          </h2>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The clarity of your question shapes the depth of your reading.
          </p>
        </motion.div>

        <motion.div variants={revealNormal} className="mb-5">
          <p className="label-overline mb-2.5" style={{ color: 'var(--text-muted)' }}>Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button key={p} onClick={() => setText(p)}
                className="rounded-full px-3 py-1.5 font-sans text-xs transition-all"
                style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-float)', color: 'var(--text-secondary)' }}>
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={revealNormal} className="mb-5">
          <Textarea label="Your question"
            placeholder="Write your question here."
            value={text}
            onChange={(e) => { if (e.target.value.length <= MAX) setText(e.target.value) }}
            rows={5}
            error={error && text.length < 10 ? error : undefined} />
          <div className="mt-1.5 flex justify-end">
            <span className="font-sans text-xs" style={{ color: text.length > 900 ? '#f59e0b' : 'var(--text-muted)' }}>
              {text.length}/{MAX}
            </span>
          </div>
        </motion.div>

        <motion.div variants={revealNormal} className="mb-6">
          <p className="label-overline mb-3" style={{ color: 'var(--text-muted)' }}>Category</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className="rounded-xl px-3 py-2.5 font-sans text-xs font-medium transition-all"
                style={category === cat.id
                  ? { border: '1px solid var(--gold)', background: 'rgba(196,150,74,0.08)', color: 'var(--gold)' }
                  : { border: '1px solid var(--border-subtle)', background: 'var(--bg-float)', color: 'var(--text-secondary)' }
                }>
                {cat.label}
              </button>
            ))}
          </div>
          {error && text.length >= 10 && !category && (
            <p className="mt-2 font-sans text-xs text-red-400">{error}</p>
          )}
        </motion.div>
      </motion.div>

      <div className="px-5 pb-10 pt-4 safe-bottom">
        <Button onClick={handleSubmit} loading={loading} fullWidth size="lg"
          disabled={text.trim().length < 10 || !category}>
          Find my reader
        </Button>
      </div>
    </motion.div>
  )
}
