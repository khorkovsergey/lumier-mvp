'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageIn, staggerNormal, revealNormal, revealSubtle } from '@/shared/animations/variants'
import { Input, Textarea } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { updateReaderProfile } from '@/server/actions/reader-profile'

const SPECIALIZATIONS = [
  'Таро', 'Астрология', 'Нумерология', 'Руны', 'Ленорман', 'Психология', 'Другое',
]

interface Profile {
  id: string
  name: string
  specialization: string
  bio: string
  phone: string | null
  experience: string | null
  methods: string | null
  about: string | null
  price: number
  user: { name: string; email: string | null }
}

export function ProfileClient({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [f, setF] = useState({
    name: profile.name,
    specialization: profile.specialization,
    experience: profile.experience || '',
    methods: profile.methods || '',
    bio: profile.bio,
    about: profile.about || '',
    phone: profile.phone || '',
    price: String(profile.price),
  })

  function set(field: string, value: string) {
    setF(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    setError('')
    setSuccess('')

    const formData = new FormData()
    Object.entries(f).forEach(([k, v]) => formData.set(k, v))

    startTransition(async () => {
      const result = await updateReaderProfile(formData)
      if (result.error) setError(result.error)
      if (result.success) setSuccess(result.success)
    })
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <div className="glass sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-2xl md:max-w-3xl px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/reader/dashboard')}
            className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}>
            ← Кабинет
          </button>
          <p className="font-serif text-base font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Lumier
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl md:max-w-3xl px-6 py-8">
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="space-y-6">

          {/* Title */}
          <motion.div variants={revealSubtle}>
            <p className="label-overline mb-2" style={{ color: 'var(--gold)' }}>Профиль</p>
            <h1 className="font-serif font-light" style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
              Информация о вас
            </h1>
            <p className="font-sans text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {profile.user.email}
            </p>
          </motion.div>

          {/* Fields */}
          <motion.div variants={revealNormal} className="space-y-4">
            <Input label="Имя и фамилия" value={f.name} onChange={e => set('name', e.target.value)} />
            <Input label="Телефон" type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} />

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

            <Input label="Опыт работы" value={f.experience} onChange={e => set('experience', e.target.value)} />
            <Input label="Методы и подходы" value={f.methods} onChange={e => set('methods', e.target.value)} />
            <Input label="Стоимость консультации ($)" type="number" value={f.price} onChange={e => set('price', e.target.value)} />
            <Textarea label="Краткое описание" value={f.bio} onChange={e => set('bio', e.target.value)} rows={3} />
            <Textarea label="Подробнее о вас" value={f.about} onChange={e => set('about', e.target.value)} rows={4} />
          </motion.div>

          {/* Messages */}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-sans text-xs text-center" style={{ color: '#F87171' }}>
              {error}
            </motion.p>
          )}
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
              <p className="font-sans text-sm" style={{ color: '#4ADE80' }}>{success}</p>
            </motion.div>
          )}

          {/* Save */}
          <motion.div variants={revealNormal} className="pt-2">
            <Button onClick={handleSave} fullWidth size="lg" loading={isPending} variant="secondary">
              Сохранить изменения
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
