'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSession, createOrder, confirmPayment } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { useFlowStore } from '@/features/flow/useFlow'
import { Button } from '@/shared/ui/Button'
import { pageIn, staggerNormal, revealNormal, revealSubtle } from '@/shared/animations/variants'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, question, reader, setSession } = useAppStore()
  const { markComplete } = useFlowStore()
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!reader.id || !user.id) {
      router.replace('/readers')
    } else {
      setReady(true)
    }
  }, [reader.id, user.id, router])

  if (!ready) return null

  async function handlePay() {
    if (!user.id || !reader.id) return
    setLoading(true)
    try {
      const sessionResult = await createSession({ userId: user.id, readerId: reader.id, type: 'ASYNC' })
      const orderResult = await createOrder({
        userId: user.id,
        sessionId: sessionResult.session.id,
        amount: reader.price!,
      })
      await confirmPayment(orderResult.order.id)
      setSession({ id: sessionResult.session.id, orderId: orderResult.order.id })
      setPaid(true)
      setTimeout(() => {
        markComplete('checkout')
        router.push('/session-format')
      }, 1200)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>

      <div className="px-5 pt-14">
        <button onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 label-overline transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h2 className="font-serif font-light" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
          Review &amp; Pay
        </h2>
      </div>

      <motion.div variants={staggerNormal} initial="hidden" animate="visible"
        className="flex-1 px-5 pt-6 space-y-4">

        {/* Order summary */}
        <motion.div variants={revealNormal} className="rounded-xl p-5 space-y-4"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
          <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Order Summary</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-serif text-xl" style={{ color: 'var(--text-primary)' }}>{reader.name}</p>
              <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{reader.specialization}</p>
            </div>
            <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>${reader.price}</p>
          </div>

          {question.text && (
            <div className="rounded-xl p-3" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
              <p className="label-overline mb-1.5" style={{ color: 'var(--text-muted)' }}>Your question</p>
              <p className="font-sans text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {question.text}
              </p>
            </div>
          )}

          <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Total due today</p>
            <p className="font-sans text-sm font-medium" style={{ color: 'var(--text-primary)' }}>${reader.price}</p>
          </div>
        </motion.div>

        {/* Simulated payment */}
        <motion.div variants={revealNormal} className="rounded-xl p-5 space-y-4"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
          <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Payment Details</p>
          <div className="space-y-3">
            <FieldRow label="Card number" value="4242 4242 4242 4242" />
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Expiry" value="12 / 28" />
              <FieldRow label="CVC" value="•••" />
            </div>
          </div>
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            ✦ Demo mode — no real charge is made.
          </p>
        </motion.div>

        <motion.div variants={revealSubtle} className="flex justify-center gap-8 py-1">
          {['Secure', 'Encrypted', 'Refundable'].map((t) => (
            <p key={t} className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{t}</p>
          ))}
        </motion.div>
      </motion.div>

      <div className="px-5 pb-10 pt-4 safe-bottom">
        {paid ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-2 rounded-2xl px-6 py-4"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <span style={{ color: '#16a34a' }}>✓</span>
            <p className="font-sans text-sm" style={{ color: '#15803d' }}>Payment confirmed</p>
          </motion.div>
        ) : (
          <Button onClick={handlePay} loading={loading} fullWidth size="lg">
            Pay ${reader.price}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="label-overline block">{label}</label>
      <div className="rounded-xl px-4 py-3 font-sans text-sm"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
        {value}
      </div>
    </div>
  )
}
