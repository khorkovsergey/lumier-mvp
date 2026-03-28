'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { pageIn } from '@/shared/animations/variants'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { resetPassword } from '@/server/actions/password-reset'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="font-sans text-sm" style={{ color: '#F87171' }}>
          Ссылка недействительна. Запросите восстановление заново.
        </p>
        <button onClick={() => router.push('/forgot-password')}
          className="font-sans text-xs transition-opacity hover:opacity-60" style={{ color: 'var(--gold)' }}>
          Запросить новую ссылку
        </button>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')

    const formData = new FormData()
    formData.set('token', token)
    formData.set('password', password)
    formData.set('confirm', confirm)

    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result.error) setError(result.error)
      if (result.success) setMessage(result.success)
    })
  }

  return (
    <>
      {message ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p className="font-sans text-sm" style={{ color: '#4ADE80' }}>{message}</p>
          </div>
          <Button onClick={() => router.push('/login')} fullWidth size="lg" variant="secondary">
            Войти
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Новый пароль"
            type="password"
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            label="Подтвердите пароль"
            type="password"
            placeholder="Повторите пароль"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" fullWidth size="lg" loading={isPending} variant="secondary">
            Сохранить новый пароль
          </Button>
        </form>
      )}
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-base)' }}>

      <div className="w-full max-w-sm md:max-w-md space-y-8">
        <div className="text-center space-y-3">
          <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
            Lumier
          </p>
          <div className="mx-auto" style={{ height: 1, width: 32, background: 'var(--gold)' }} />
          <h1 className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
            Новый пароль
          </h1>
        </div>

        <Suspense fallback={
          <div className="text-center py-8">
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" style={{ color: 'var(--gold)' }} />
          </div>
        }>
          <ResetForm />
        </Suspense>
      </div>
    </motion.div>
  )
}
