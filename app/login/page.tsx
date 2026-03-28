'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { loginClient } from '@/server/actions/auth'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { pageIn, staggerNormal, revealHero, revealNormal } from '@/shared/animations/variants'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    try {
      const result = await loginClient(formData)
      if (result?.error) setError(result.error)
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-base)' }}>

      <div className="w-full max-w-sm md:max-w-md">
        {/* Логотип */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="mb-10 text-center">
          <Link href="/">
            <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
              Lumier
            </p>
          </Link>
          <div className="mx-auto mt-2" style={{ height: 1, width: 24, background: 'var(--gold)' }} />
        </motion.div>

        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={revealHero}>
            <h1 className="font-serif font-light mb-1" style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
              Вход
            </h1>
            <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
              Нет аккаунта?{' '}
              <Link href="/register" className="underline" style={{ color: 'var(--gold)' }}>
                Зарегистрироваться
              </Link>
            </p>
          </motion.div>

          <motion.form variants={revealNormal} onSubmit={handleSubmit} className="space-y-4">
            <Input name="email" label="Email" type="email" placeholder="you@example.com" required />
            <Input name="password" label="Пароль" type="password" placeholder="••••••" required />

            <div className="text-right">
              <Link href="/forgot-password"
                className="font-sans text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--gold)' }}>
                Забыли пароль?
              </Link>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="font-sans text-xs text-red-500 text-center">
                {error}
              </motion.p>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg">
              Войти
            </Button>
          </motion.form>

          <motion.div variants={revealNormal} className="text-center">
            <Link href="/reader/login"
              className="font-sans text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              Я консультант →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
