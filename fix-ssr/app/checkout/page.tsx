'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSession, createOrder, confirmPayment } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { useFlowStore } from '@/features/flow/useFlow'
import { Button } from '@/shared/ui/Button'
import { pageTransition, staggerContainer, staggerItem } from '@/shared/animations/variants'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, question, reader, setSession } = useAppStore()
  const { markComplete } = useFlowStore()
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)

  if (!reader.id || !user.id) { router.replace('/readers'); return null }

  async function handlePay() {
    if (!user.id || !reader.id) return
    setLoading(true)
    try {
      // Create session with ASYNC as default; type is updated after format selection
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
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col bg-ivory-50">

      <div className="px-5 pt-14">
        <button onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h2 className="font-serif text-[2rem] font-light text-stone-800">Review & Pay</h2>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="flex-1 px-5 pt-6 space-y-4">

        {/* Order summary */}
        <motion.div variants={staggerItem}
          className="rounded-2xl border border-stone-100 bg-white p-5 space-y-4">
          <p className="font-sans text-[11px] uppercase tracking-widest text-stone-400">Order Summary</p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-serif text-xl text-stone-800">{reader.name}</p>
              <p className="font-sans text-xs text-stone-400 mt-0.5">{reader.specialization}</p>
            </div>
            <p className="font-serif text-2xl font-light text-stone-800">${reader.price}</p>
          </div>

          {question.text && (
            <div className="rounded-xl bg-ivory-100 border border-stone-100 p-3">
              <p className="font-sans text-[11px] uppercase tracking-widest text-stone-400 mb-1.5">Your question</p>
              <p className="font-sans text-sm leading-relaxed text-stone-600 line-clamp-3">{question.text}</p>
            </div>
          )}

          <div className="border-t border-stone-100 pt-3 flex justify-between">
            <p className="font-sans text-sm text-stone-500">Total due today</p>
            <p className="font-sans text-sm font-medium text-stone-800">${reader.price}</p>
          </div>
        </motion.div>

        {/* Simulated payment form */}
        <motion.div variants={staggerItem}
          className="rounded-2xl border border-stone-100 bg-white p-5 space-y-4">
          <p className="font-sans text-[11px] uppercase tracking-widest text-stone-400">Payment Details</p>
          <div className="space-y-3">
            <FieldRow label="Card number" value="4242 4242 4242 4242" />
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Expiry" value="12 / 28" />
              <FieldRow label="CVC" value="•••" />
            </div>
          </div>
          <p className="font-sans text-xs text-stone-400">
            ✦ Demo mode — no real charge is made.
          </p>
        </motion.div>

        <motion.div variants={staggerItem} className="flex justify-center gap-8 py-1">
          {['Secure', 'Encrypted', 'Refundable'].map((t) => (
            <p key={t} className="font-sans text-xs text-stone-400">{t}</p>
          ))}
        </motion.div>
      </motion.div>

      <div className="px-5 pb-10 pt-4 safe-bottom">
        {paid ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-4">
            <span className="text-emerald-500">✓</span>
            <p className="font-sans text-sm text-emerald-700">Payment confirmed</p>
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
      <label className="block font-sans text-[11px] font-medium uppercase tracking-widest text-stone-400">{label}</label>
      <div className="w-full rounded-2xl border border-stone-200 bg-ivory-50 px-4 py-3 font-sans text-sm text-stone-600">
        {value}
      </div>
    </div>
  )
}
