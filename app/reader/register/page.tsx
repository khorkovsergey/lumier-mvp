'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageIn, staggerNormal, revealHero, revealNormal, revealSubtle } from '@/shared/animations/variants'
import { Input, Textarea } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { registerReader } from '@/server/actions/auth'
import Link from 'next/link'

const SPECIALIZATIONS = [
  'Таро', 'Астрология', 'Нумерология', 'Руны', 'Ленорман', 'Психология', 'Другое',
]

export default function ReaderRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()
  const [spec, setSpec] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (step === 1) { setStep(2); return }

    const formData = new FormData(e.currentTarget)
    formData.set('specialization', spec || formData.get('specialization') as string)

    startTransition(async () => {
      const result = await registerReader(formData)
      if (result.error) setError(result.error)
      if (result.success) setSuccess(result.success)
    })
  }

  if (success) {
    return (
      <motion.div variants={pageIn} initial="hidden" animate="visible"
        className="flex min-h-screen flex-col items-center justify-center px-6"
        style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-sm md:max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.06)' }}>
            <span style={{ color: '#4ADE80', fontSize: '1.5rem' }}>✓</span>
          </div>
          <h2 className="font-serif text-xl font-light" style={{ color: 'var(--text-primary)' }}>Заявка отправлена</h2>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{success}</p>
          <Button onClick={() => router.push('/')} fullWidth variant="ghost">На главную</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--bg-base)' }}>

      <div className="w-full max-w-sm md:max-w-md">
        {/* Header */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="mb-8 text-center">
          <Link href="/">
            <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em' }}>Lumier</p>
          </Link>
          <div className="mx-auto mt-2" style={{ height: 1, width: 24, background: 'var(--gold)' }} />
          <p className="label-overline mt-3" style={{ color: 'var(--gold)' }}>Анкета консультанта</p>
        </motion.div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="h-[2px] flex-1 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'var(--gold)' }}
                animate={{ scaleX: s <= step ? 1 : 0 }} initial={{ scaleX: 0, originX: 0 }}
                transition={{ duration: 0.4 }} />
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="space-y-5">
              <motion.div variants={revealHero}>
                <h2 className="font-serif font-light mb-1" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  Расскажите о себе
                </h2>
                <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Шаг 1 из 2 — Личные данные</p>
              </motion.div>

              <motion.div variants={revealNormal} className="space-y-4">
                <Input name="name" label="Имя и фамилия" placeholder="Как к вам обращаться" required />
                <Input name="email" label="Email" type="email" placeholder="you@example.com" required />
                <Input name="password" label="Пароль" type="password" placeholder="Минимум 8 символов" required minLength={8} />
                <Input name="phone" label="Телефон" type="tel" placeholder="+7 (___) ___-__-__" required />
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="space-y-5">
              <motion.div variants={revealHero}>
                <h2 className="font-serif font-light mb-1" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  Профессиональный опыт
                </h2>
                <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Шаг 2 из 2 — Расскажите о вашей практике</p>
              </motion.div>

              <motion.div variants={revealNormal} className="space-y-4">
                {/* Specialization */}
                <div className="space-y-1.5">
                  <label className="label-overline block">Специализация</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map(s => (
                      <button key={s} type="button" onClick={() => setSpec(s)}
                        className="rounded-full px-3 py-1.5 font-sans text-xs transition-all"
                        style={{
                          background: spec === s ? 'var(--gold)' : 'var(--bg-raised)',
                          color: spec === s ? '#0E1520' : 'var(--text-secondary)',
                          border: spec === s ? 'none' : '1px solid var(--border-subtle)',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="specialization" value={spec} />
                </div>

                <Input name="experience" label="Опыт работы" placeholder="Например: 5 лет практики" required />
                <Input name="methods" label="Методы и подходы" placeholder="Таро Уэйта, астрологические карты..." required />
                <Input name="price" label="Стоимость консультации ($)" type="number" placeholder="50" required min={1} />
                <Textarea name="bio" label="Краткое описание" placeholder="2-3 предложения о вашем подходе (мин. 20 символов)" required rows={3} />
                <Textarea name="about" label="Подробнее о вас (опционально)" placeholder="Образование, сертификаты, философия работы..." rows={4} />
              </motion.div>
            </motion.div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-sans text-xs text-center" style={{ color: '#F87171' }}>
              {error}
            </motion.p>
          )}

          <div className="space-y-3 pt-2">
            <Button type="submit" fullWidth size="lg" loading={isPending}>
              {step === 1 ? 'Продолжить' : 'Отправить анкету'}
            </Button>
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)}
                className="w-full font-sans text-sm transition-colors py-2" style={{ color: 'var(--text-muted)' }}>
                ← Назад
              </button>
            )}
          </div>
        </form>

        <motion.div variants={revealSubtle} initial="hidden" animate="visible" className="text-center mt-6">
          <Link href="/reader/login" className="font-sans text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            Уже есть аккаунт? <span style={{ color: 'var(--gold)' }}>Войти</span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
