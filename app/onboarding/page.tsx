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
    if (!name.trim() || name.trim().length < 2) errs.name = 'Пожалуйста, введите ваше имя'
    setErrors(errs)
    return !errs.name
  }

  function validateStep2() {
    const errs: typeof errors = {}
    if (!dob) { errs.dob = 'Пожалуйста, укажите дату рождения'; setErrors(errs); return false }
    const parts = dob.split('.')
    if (parts.length !== 3) { errs.dob = 'Формат: дд.мм.гггг'; setErrors(errs); return false }
    const [dd, mm, yyyy] = parts.map(Number)
    const parsed = new Date(yyyy, mm - 1, dd)
    if (isNaN(parsed.getTime()) || parsed.getDate() !== dd || parsed.getMonth() !== mm - 1) {
      errs.dob = 'Некорректная дата'
    } else {
      const age = new Date().getFullYear() - yyyy
      if (age < 18) errs.dob = 'Вам должно быть не менее 18 лет'
      else if (age > 120) errs.dob = 'Пожалуйста, введите корректную дату'
    }
    setErrors(errs)
    return !errs.dob
  }

  function formatDobInput(value: string) {
    // Allow only digits and dots, auto-insert dots
    const digits = value.replace(/[^\d]/g, '')
    let formatted = ''
    if (digits.length <= 2) formatted = digits
    else if (digits.length <= 4) formatted = digits.slice(0, 2) + '.' + digits.slice(2)
    else formatted = digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8)
    setDob(formatted)
  }

  async function handleContinue() {
    if (step === 1) { if (validateStep1()) setStep(2); return }
    if (!validateStep2()) return
    setLoading(true)
    try {
      // Convert dd.mm.yyyy → ISO string for backend
      const [dd, mm, yyyy] = dob.split('.').map(Number)
      const isoDate = new Date(yyyy, mm - 1, dd).toISOString().split('T')[0]
      const result = await createUser({ name: name.trim(), dateOfBirth: isoDate })
      if (result.success) {
        setUser({ id: result.user.id, name: result.user.name, dateOfBirth: dob })
        markComplete('onboarding')
        router.push('/question')
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const firstName = name.split(' ')[0] || 'вас'

  return (
    <motion.div
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex min-h-screen flex-col"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{ background: 'linear-gradient(to bottom, rgba(196,150,74,0.04), transparent)' }}
      />

      {/* Шапка */}
      <div className="relative px-6 pt-14">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Lumier
          </p>
          <div className="mt-1.5" style={{ height: 1, width: 24, background: 'var(--gold)' }} />
        </motion.div>
      </div>

      {/* Индикатор шага */}
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

      {/* Контент */}
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
                Шаг 1 из 2
              </motion.p>
              <motion.h2
                variants={revealHero}
                className="font-serif mb-3 font-light"
                style={{ fontSize: '2.25rem', lineHeight: 1.1, color: 'var(--text-primary)' }}
              >
                Прежде чем начать,<br />кто вы?
              </motion.h2>
              <motion.p
                variants={revealNormal}
                className="font-sans text-sm leading-relaxed mb-10"
                style={{ color: 'var(--text-secondary)' }}
              >
                Ваше имя помогает консультанту выстроить связь с вами — не только с вашим вопросом.
              </motion.p>
              <motion.div variants={revealNormal}>
                <Input
                  label="Ваше имя"
                  type="text"
                  placeholder="Имя и фамилия"
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
                Шаг 2 из 2
              </motion.p>
              <motion.h2
                variants={revealHero}
                className="font-serif mb-3 font-light"
                style={{ fontSize: '2.25rem', lineHeight: 1.1, color: 'var(--text-primary)' }}
              >
                Здравствуйте, {firstName}.<br />Ещё один момент.
              </motion.h2>
              <motion.p
                variants={revealNormal}
                className="font-sans text-sm leading-relaxed mb-10"
                style={{ color: 'var(--text-secondary)' }}
              >
                Дата рождения задаёт астрологический контекст, на который опирается ваш Консультант.
              </motion.p>
              <motion.div variants={revealNormal}>
                <Input
                  label="Дата рождения"
                  type="text"
                  inputMode="numeric"
                  placeholder="дд.мм.гггг"
                  value={dob}
                  onChange={(e) => formatDobInput(e.target.value)}
                  error={errors.dob}
                  maxLength={10}
                />
              </motion.div>
              <motion.div
                variants={revealSubtle}
                className="mt-6 rounded-lg px-4 py-3"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Ваши данные используются исключительно для расклада. Мы никогда не передаём и не храним их после сессии.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Кнопки */}
      <div className="relative px-6 pb-10 pt-6 safe-bottom space-y-3">
        <Button onClick={handleContinue} loading={loading} fullWidth size="lg">
          {step === 1 ? 'Продолжить' : 'Начать  консультацию'}
        </Button>
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="w-full font-sans text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Назад
          </button>
        )}
      </div>
    </motion.div>
  )
}
