'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageIn } from '@/shared/animations/variants'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { requestPasswordReset } from '@/server/actions/password-reset'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.set('email', email)

    startTransition(async () => {
      const result = await requestPasswordReset(formData)
      if (result.error) setError(result.error)
      if (result.success) setMessage(result.success)
    })
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-base)' }}>

      <div className="w-full max-w-sm md:max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <button onClick={() => router.push('/login')}
            className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
            Lumier
          </button>
          <div className="mx-auto" style={{ height: 1, width: 32, background: 'var(--gold)' }} />
          <h1 className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
            Восстановление пароля
          </h1>
          <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
            Введите email, указанный при регистрации
          </p>
        </div>

        {/* Success message */}
        {message && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p className="font-sans text-sm" style={{ color: '#4ADE80' }}>{message}</p>
          </motion.div>
        )}

        {/* Form */}
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
            />
            <Button type="submit" fullWidth size="lg" loading={isPending} variant="secondary">
              Отправить ссылку
            </Button>
          </form>
        )}

        {/* Back */}
        <p className="text-center font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
          <button onClick={() => router.push('/login')}
            className="transition-opacity hover:opacity-60" style={{ color: 'var(--gold)' }}>
            ← Вернуться к входу
          </button>
        </p>
      </div>
    </motion.div>
  )
}
