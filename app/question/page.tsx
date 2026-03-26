'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createQuestion } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { useFlowStore } from '@/features/flow/useFlow'
import { Button } from '@/shared/ui/Button'
import { Textarea } from '@/shared/ui/Input'
import { pageTransition, staggerContainer, staggerItem } from '@/shared/animations/variants'
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
  const charCount = text.length
  const MAX = 1000

  if (!user.id) { router.replace('/onboarding'); return null }

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
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col bg-ivory-50">

      {/* Nav */}
      <div className="flex items-center justify-between px-5 pt-14">
        <p className="font-serif text-xl font-light text-stone-800">Lumina</p>
        <Link href="/insights"
          className="font-sans text-[11px] uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors">
          Insights
        </Link>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="flex flex-1 flex-col px-5 pt-8">

        <motion.div variants={staggerItem} className="space-y-2 mb-8">
          <h2 className="font-serif text-[2rem] font-light leading-snug text-stone-800">
            What would you like<br />to explore?
          </h2>
          <p className="font-sans text-sm leading-relaxed text-stone-500">
            The clarity of your question shapes the depth of your reading.
          </p>
        </motion.div>

        {/* Prompt chips */}
        <motion.div variants={staggerItem} className="mb-5">
          <p className="mb-2.5 font-sans text-[11px] uppercase tracking-widest text-stone-400">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button key={p} onClick={() => setText(p)}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 font-sans text-xs text-stone-600 transition-all hover:border-gold-300 hover:bg-ivory-100 hover:text-stone-800">
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Question textarea */}
        <motion.div variants={staggerItem} className="mb-5">
          <Textarea label="Your question"
            placeholder="Write your question here. Be as specific or as open as feels right."
            value={text}
            onChange={(e) => { if (e.target.value.length <= MAX) setText(e.target.value) }}
            rows={5}
            error={error && text.length < 10 ? error : undefined} />
          <div className="mt-1.5 flex justify-end">
            <span className={`font-sans text-xs ${charCount > 900 ? 'text-amber-500' : 'text-stone-300'}`}>
              {charCount}/{MAX}
            </span>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div variants={staggerItem} className="mb-6">
          <p className="mb-3 font-sans text-[11px] uppercase tracking-widest text-stone-400">Category</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`rounded-xl border px-3 py-2.5 font-sans text-xs font-medium transition-all ${
                  category === cat.id
                    ? 'border-gold-400 bg-gold-300/10 text-gold-600'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
          {error && text.length >= 10 && !category && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
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
