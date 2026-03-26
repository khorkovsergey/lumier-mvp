'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createUser } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { useFlowStore } from '@/features/flow/useFlow'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { pageIn, staggerNormal, revealHero, revealNormal, revealSubtle, dur, ease } from '@/shared/animations/variants'

export default function OnboardingPage() {
  const router = useRouter()
  const { setUser } = useAppStore()
  const { markComplete } = useFlowStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [errors, setErrors] = useState<{ name?: string; dob?: string }>({})
  const [loading, setLoading] = useState(false)

  function validateStep1() {
    const errs: typeof errors = {}
    if (!name.trim() || name.trim().length < 2) errs.name = 'Please enter your name'
    setErrors(errs)
    return !errs.name
  }

  function validateStep2() {
    const errs: typeof errors = {}
    if (!dob) { errs.dob = 'Please enter your date of birth'; setErrors(errs); return false }
    const parsed = new Date(dob)
    const age = new Date().getFullYear() - parsed.getFullYear()
    if (isNaN(parsed.getTime())) errs.dob = 'Invalid date'
    else if (age < 18) errs.dob = 'You must be at least 18'
    else if (age > 120) errs.dob = 'Please enter a valid date'
    setErrors(errs)
    return !errs.dob
  }

  async function handleContinue() {
    if (step === 1) { if (validateStep1()) setStep(2); return }
    if (!validateStep2()) return
    setLoading(true)
    try {
      const result = await createUser({ name: name.trim(), dateOfBirth: dob })
      if (result.success) {
        setUser({ id: result.user.id, name: result.user.name, dateOfBirth: dob })
        markComplete('onboarding')
        router.push('/question')
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const firstName = name.split(' ')[0] || 'you'

  return (
    <motion.div
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient top accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{ background: 'linear-gradient(to bottom, rgba(196,150,74,0.04), transparent)' }}
      />

      {/* Header */}
      <div className="relative px-6 pt-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Lumina
          </p>
          <div className="mt-1.5" style={{ height: 1, width: 24, background: 'var(--gold)' }} />
        </motion.div>
      </div>

      {/* Step progress bar */}
      <div className="relative px-6 pt-8">
        <div className="flex gap-1.5">
          {[1, 2].map((s) => (
            <div key={s} className="h-[2px] flex-1 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--gold)' }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: s <= step ? 1 : 0 }}
                transition={{ duration: 0.5, ease: ease.outSoft }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col px-6 pt-12">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="s1"
              variants={staggerNormal}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20, transition: { duration: dur.fast } }}
            >
              <motion.p variants={revealSubtle} className="label-overline mb-3" style={{ color: 'var(--gold)' }}>
                Step 1 of 2
              </motion.p>
              <motion.h2
                variants={revealHero}
                className="font-serif mb-3 font-light"
                style={{ fontSize: '2.25rem', lineHeight: 1.1, color: 'var(--text-primary)' }}
              >
                Before we begin,<br />who are you?
              </motion.h2>
              <motion.p
                variants={revealNormal}
                className="font-sans text-sm leading-relaxed mb-10"
                style={{ color: 'var(--text-secondary)' }}
              >
                Your reader uses your name to ground the reading in who you actually are — not just what you&apos;re asking.
              </motion.p>
              <motion.div variants={revealNormal}>
                <Input
                  label="Your name"
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  autoFocus
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="s2"
              variants={staggerNormal}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -20, transition: { duration: dur.fast } }}
            >
              <motion.p variants={revealSubtle} className="label-overline mb-3" style={{ color: 'var(--gold)' }}>
                Step 2 of 2
              </motion.p>
              <motion.h2
                variants={revealHero}
                className="font-serif mb-3 font-light"
                style={{ fontSize: '2.25rem', lineHeight: 1.1, color: 'var(--text-primary)' }}
              >
                Hello, {firstName}.<br />One more thing.
              </motion.h2>
              <motion.p
                variants={revealNormal}
                className="font-sans text-sm leading-relaxed mb-10"
                style={{ color: 'var(--text-secondary)' }}
              >
                Your date of birth provides astrological context your reader draws on. It&apos;s used only for your reading.
              </motion.p>
              <motion.div variants={revealNormal}>
                <Input
                  label="Date of birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  error={errors.dob}
                  max={new Date().toISOString().split('T')[0]}
                />
              </motion.div>
              <motion.div
                variants={revealSubtle}
                className="mt-6 rounded-lg px-4 py-3"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Your information is used only for your reading. It is never shared, sold, or retained beyond your session.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="relative px-6 pb-10 pt-6 safe-bottom space-y-3">
        <Button onClick={handleContinue} loading={loading} fullWidth size="lg">
          {step === 1 ? 'Continue' : 'Begin my reading'}
        </Button>
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="w-full font-sans text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back
          </button>
        )}
      </div>
    </motion.div>
  )
}
