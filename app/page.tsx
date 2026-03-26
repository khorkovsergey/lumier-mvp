'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAppStore } from '@/shared/lib/store'
import { dur, ease } from '@/shared/animations/variants'

export default function SplashPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const redirected = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (redirected.current) return
      redirected.current = true
      router.push(user.id ? '/question' : '/onboarding')
    }, 3200)
    return () => clearTimeout(timer)
  }, [router, user.id])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-base)' }}>

      {/* Ambient radial glow — very subtle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.4, ease: ease.outSoft }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(196,150,74,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Wordmark group */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.verySlow, ease: ease.outSoft, delay: 0.3 }}
        className="relative text-center"
      >
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, letterSpacing: '0.18em' }}
          transition={{ duration: 1, ease: ease.outSoft, delay: 0.6 }}
          className="mb-5 label-overline"
          style={{ color: 'var(--gold)' }}
        >
          Personal Insight
        </motion.p>

        {/* Name */}
        <h1
          className="font-serif text-[4rem] font-light leading-none"
          style={{
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
            fontFeatureSettings: '"kern" 1, "liga" 1',
          }}
        >
          Lumina
        </h1>

        {/* Animated rule */}
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

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-4 font-sans text-xs"
          style={{ letterSpacing: '0.15em', color: 'var(--text-secondary)' }}
        >
          A space for genuine reflection
        </motion.p>
      </motion.div>

      {/* Breath indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-14"
      >
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{ background: 'var(--gold-light)' }}
              className="rounded-full"
              animate={{
                width:   i === 1 ? [4, 12, 4] : [3, 6, 3],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
              initial={{ width: 4, height: 4 }}
              style={{
              width: 4,
              height: 4,
              borderRadius: 999,
              background: 'var(--gold-light)'
               }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
