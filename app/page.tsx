'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { dur, ease } from '@/shared/animations/variants'

export default function SplashPage() {
  const router = useRouter()

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: ease.outSoft }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 44%, rgba(196,150,74,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Логотип */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.verySlow, ease: ease.outSoft, delay: 0.3 }}
        className="relative text-center mb-16"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: ease.outSoft, delay: 0.6 }}
          className="label-overline mb-5"
          style={{ color: 'var(--gold)' }}
        >
          Your insights
        </motion.p>

        <h1
          className="font-serif font-light leading-none"
          style={{ fontSize: '4rem', color: 'var(--text-primary)', letterSpacing: '0.08em' }}
        >
          Lumier
        </h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: ease.out, delay: 1.0 }}
          className="mx-auto mt-5 origin-center"
          style={{
            height: '1px',
            width: '48px',
            background: 'linear-gradient(to right, transparent, var(--gold), transparent)',
          }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-4 font-sans text-xs"
          style={{ letterSpacing: '0.15em', color: 'var(--text-secondary)' }}
        >
          Пространство для подлинного размышления
        </motion.p>
      </motion.div>

      {/* Карточки выбора роли */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: ease.outSoft, delay: 1.8 }}
        className="relative w-full max-w-xs px-6 space-y-3"
      >
        {/* Клиент */}
        <motion.button
          whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(196,150,74,0.15)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/onboarding')}
          className="w-full rounded-2xl px-6 py-5 text-left transition-all"
          style={{
            background: 'var(--bg-float)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-lg font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Я ищу ответы
              </p>
              <p className="font-sans text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Начать консультацию
              </p>
            </div>
            <span style={{ color: 'var(--gold)', fontSize: '1.25rem' }}>✦</span>
          </div>
        </motion.button>

        {/* Новости и прогнозы */}
        <motion.button
          whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(196,150,74,0.10)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/insights')}
          className="w-full rounded-2xl px-6 py-5 text-left transition-all"
          style={{
            background: 'var(--bg-float)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-lg font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Новости и прогнозы
              </p>
              <p className="font-sans text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                От экспертов Lumier
              </p>
            </div>
            <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>✧</span>
          </div>
        </motion.button>

        {/* Консультант */}
        <motion.button
          whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/reader/login')}
          className="w-full rounded-2xl px-6 py-5 text-left transition-all"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-lg font-medium" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Я консультант
              </p>
              <p className="font-sans text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Войти в кабинет
              </p>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>◈</span>
          </div>
        </motion.button>

        {/* Уже есть аккаунт */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 0.6 }}
          className="text-center font-sans text-xs pt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Уже есть аккаунт?{' '}
          <button
            onClick={() => router.push('/login')}
            className="underline transition-opacity hover:opacity-60"
            style={{ color: 'var(--gold)' }}
          >
            Войти
          </button>
        </motion.p>
      </motion.div>
    </div>
  )
}
