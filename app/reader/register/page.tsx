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

  // All fields stored in state so nothing is lost between steps
  const [f, setF] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', experience: '', methods: '',
    price: '', bio: '', about: '',
  })

  function set(field: string, value: string) {
    setF(prev => ({ ...prev, [field]: value }))
  }

  function goToStep2() {
    setError('')
    if (!f.name.trim() || f.name.trim().length < 2) { setError('Введите имя (минимум 2 символа)'); return }
    if (!f.email.includes('@')) { setError('Введите корректный email'); return }
    if (f.password.length < 8) { setError('Пароль — минимум 8 символов'); return }
    if (!f.phone.trim()) { setError('Введите телефон'); return }
    setStep(2)
  }

  function handleSubmit() {
    setError('')
    if (!f.specialization) { setError('Выберите специализацию'); return }
    if (!f.experience.trim()) { setError('Укажите опыт работы'); return }
    if (!f.methods.trim()) { setError('Укажите методы работы'); return }
    if (f.bio.trim().length < 20) { setError('Описание — минимум 20 символов'); return }

    const formData = new FormData()
    Object.entries(f).forEach(([k, v]) => formData.set(k, v))

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
        <div className="mb-8 text-center">
          <Link href="/">
            <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em' }}>Lumier</p>
          </Link>
          <div className="mx-auto mt-2" style={{ height: 1, width: 24, background: 'var(--gold)' }} />
          <p className="label-overline mt-3" style={{ color: 'var(--gold)' }}>Анкета консультанта</p>
        </div>

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

        <div className="space-y-5">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} className="space-y-5">
              <div>
                <h2 className="font-serif font-light mb-1" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  Расскажите о себе
                </h2>
                <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Шаг 1 из 2 — Личные данные</p>
              </div>

              <div className="space-y-4">
                <Input label="Имя и фамилия" placeholder="Как к вам обращаться"
                  value={f.name} onChange={e => set('name', e.target.value)} />
                <Input label="Email" type="email" placeholder="you@example.com"
                  value={f.email} onChange={e => set('email', e.target.value)} />
                <Input label="Пароль" type="password" placeholder="Минимум 8 символов"
                  value={f.password} onChange={e => set('password', e.target.value)} />
                <Input label="Телефон" type="tel" placeholder="+7 (___) ___-__-__"
                  value={f.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }} className="space-y-5">
              <div>
                <h2 className="font-serif font-light mb-1" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  Профессиональный опыт
                </h2>
                <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Шаг 2 из 2 — Расскажите о вашей практике</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="label-overline block">Специализация</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map(s => (
                      <button key={s} type="button" onClick={() => set('specialization', s)}
                        className="rounded-full px-3 py-1.5 font-sans text-xs transition-all"
                        style={{
                          background: f.specialization === s ? 'var(--gold)' : 'var(--bg-raised)',
                          color: f.specialization === s ? '#0E1520' : 'var(--text-secondary)',
                          border: f.specialization === s ? 'none' : '1px solid var(--border-subtle)',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <Input label="Опыт работы" placeholder="Например: 5 лет практики"
                  value={f.experience} onChange={e => set('experience', e.target.value)} />
                <Input label="Методы и подходы" placeholder="Таро Уэйта, астрологические карты..."
                  value={f.methods} onChange={e => set('methods', e.target.value)} />
                <Input label="Стоимость консультации ($)" type="number" placeholder="50"
                  value={f.price} onChange={e => set('price', e.target.value)} />
                <Textarea label="Краткое описание" placeholder="2-3 предложения о вашем подходе (мин. 20 символов)"
                  value={f.bio} onChange={e => set('bio', e.target.value)} rows={3} />
                <Textarea label="Подробнее о вас (опционально)" placeholder="Образование, сертификаты, философия работы..."
                  value={f.about} onChange={e => set('about', e.target.value)} rows={4} />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-sans text-xs text-center" style={{ color: '#F87171' }}>
              {error}
            </motion.p>
          )}

          <div className="space-y-3 pt-2">
            {step === 1 ? (
              <Button onClick={goToStep2} fullWidth size="lg">Продолжить</Button>
            ) : (
              <>
                <Button onClick={handleSubmit} fullWidth size="lg" loading={isPending}>Отправить анкету</Button>
                <button type="button" onClick={() => { setError(''); setStep(1) }}
                  className="w-full font-sans text-sm transition-colors py-2" style={{ color: 'var(--text-muted)' }}>
                  ← Назад
                </button>
              </>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/reader/login" className="font-sans text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            Уже есть аккаунт? <span style={{ color: 'var(--gold)' }}>Войти</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
