'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { dur, ease } from '@/shared/animations/variants'
import { LifeLinesCanvas } from './LifeLinesCanvas'
import { SPREAD_ORDER, SPREAD_LABELS, MAJOR_SYMBOLS, ROMAN } from '@/entities/tarot'

// ─── Types & Constants ────────────────────────────────────────────────────────

type Screen = 'hero' | 'explain' | 'question' | 'spread' | 'result' | 'signup'

// Fixed demo cards for simulated spread
const DEMO_CARDS = [
  { id: 0,  nameRu: 'Шут',              arcana: 'major' as const, position: 'past'     as const, isReversed: false },
  { id: 6,  nameRu: 'Влюблённые',       arcana: 'major' as const, position: 'present'  as const, isReversed: false },
  { id: 9,  nameRu: 'Отшельник',        arcana: 'major' as const, position: 'future'   as const, isReversed: false },
  { id: 10, nameRu: 'Колесо Фортуны',   arcana: 'major' as const, position: 'internal' as const, isReversed: false },
  { id: 17, nameRu: 'Звезда',           arcana: 'major' as const, position: 'external' as const, isReversed: false },
  { id: 18, nameRu: 'Луна',             arcana: 'major' as const, position: 'guidance' as const, isReversed: false },
]

const DEMO_INSIGHT = 'Сейчас вы находитесь в точке, где ясность приходит изнутри, а не извне.'

const DEMO_TEXT = 'Этот период связан с переосмыслением и поиском своего направления. Некоторые обстоятельства могут казаться нестабильными, но именно они ведут вас к росту. Перед вами этап изменений — не резких, но значимых. Важно довериться процессу, даже если сейчас не всё очевидно.'

// ─── Page transitions ─────────────────────────────────────────────────────────

const screenIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('hero')
  const [demoQuestion, setDemoQuestion] = useState('')

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Background on hero only */}
      {screen === 'hero' && <LifeLinesCanvas />}

      {/* Ambient glow — always present */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 25%, rgba(212,149,74,0.05) 0%, transparent 60%)' }} />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === 'hero'     && <HeroScreen     key="hero"     onTry={() => setScreen('explain')} router={router} />}
          {screen === 'explain'  && <ExplainScreen   key="explain"  onContinue={() => setScreen('question')} />}
          {screen === 'question' && <QuestionScreen  key="question" question={demoQuestion} setQuestion={setDemoQuestion} onContinue={() => setScreen('spread')} />}
          {screen === 'spread'   && <SpreadScreen    key="spread"   onDone={() => setScreen('result')} />}
          {screen === 'result'   && <ResultScreen    key="result"   onContinue={() => setScreen('signup')} />}
          {screen === 'signup'   && <SignupScreen    key="signup"   router={router} />}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — HERO
// ═══════════════════════════════════════════════════════════════════════════════

function HeroScreen({ onTry, router }: { onTry: () => void; router: ReturnType<typeof useRouter> }) {
  return (
    <motion.div {...screenIn} className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.verySlow, ease: ease.outSoft, delay: 0.3 }}
        className="text-center mb-14"
      >
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }} className="label-overline mb-4" style={{ color: 'var(--gold)' }}>
          Lumier
        </motion.p>
        <h1 className="font-serif font-light leading-[1.1] mx-auto max-w-sm"
          style={{ fontSize: '2.2rem', color: 'var(--text-primary)' }}>
          Обрети ясность,
          <br />когда она нужна
          <br />больше всего
        </h1>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }} className="mx-auto mt-5 origin-center"
          style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, var(--gold), transparent)' }} />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-4 font-sans text-sm mx-auto max-w-xs"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Узнай больше, чем можно увидеть — через язык символов, силу&nbsp;ИИ и&nbsp;личного консультанта
        </motion.p>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="w-full max-w-xs space-y-3">
        {/* Primary CTA */}
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onTry}
          className="w-full rounded-2xl px-6 py-4 font-sans text-sm font-medium transition-all"
          style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 24px rgba(212,149,74,0.20)' }}>
          Попробовать ✦
        </motion.button>

        {/* Secondary */}
        <div className="flex gap-2">
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/login')}
            className="flex-1 rounded-2xl px-4 py-3 font-sans text-xs transition-all"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            Войти
          </motion.button>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/register')}
            className="flex-1 rounded-2xl px-4 py-3 font-sans text-xs transition-all"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            Регистрация
          </motion.button>
        </div>

        {/* Reader/Admin link */}
        <p className="text-center font-sans text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
          <button onClick={() => router.push('/reader/login')}
            className="underline transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
            Для консультантов
          </button>
        </p>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — EXPLAIN
// ═══════════════════════════════════════════════════════════════════════════════

function ExplainScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div {...screenIn}
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm space-y-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ border: '1px solid rgba(212,149,74,0.3)', background: 'rgba(212,149,74,0.06)' }}>
          <span style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>◈</span>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="font-serif font-light" style={{ fontSize: '2rem', color: 'var(--text-primary)', lineHeight: 1.15 }}>
          Это не предсказание
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Это способ посмотреть на ситуацию глубже и увидеть то, что раньше оставалось незаметным
        </motion.p>

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onContinue}
          className="rounded-2xl px-10 py-3.5 font-sans text-sm font-medium"
          style={{ background: 'var(--gold)', color: '#0E1520' }}>
          Продолжить
        </motion.button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — QUESTION INPUT
// ═══════════════════════════════════════════════════════════════════════════════

function QuestionScreen({ question, setQuestion, onContinue }: {
  question: string; setQuestion: (q: string) => void; onContinue: () => void
}) {
  return (
    <motion.div {...screenIn} className="flex min-h-screen flex-col justify-center px-6">
      <div className="mx-auto max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <p className="label-overline" style={{ color: 'var(--gold)' }}>Ваш вопрос</p>
          <h2 className="font-serif font-light" style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
            Что вас сейчас волнует?
          </h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="Напишите здесь..."
            rows={4} maxLength={500}
            className="w-full rounded-2xl px-5 py-4 font-sans text-sm outline-none resize-none"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', lineHeight: 1.8 }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(212,149,74,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,149,74,0.08)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none' }}
            autoFocus
          />
          <p className="font-sans text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Вы можете спросить про отношения, карьеру или ситуацию, в которой нет ясности
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center">
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onContinue}
            className="rounded-2xl px-10 py-3.5 font-sans text-sm font-medium"
            style={{ background: 'var(--gold)', color: '#0E1520' }}>
            Продолжить
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — SIMULATED SPREAD
// ═══════════════════════════════════════════════════════════════════════════════

function SpreadScreen({ onDone }: { onDone: () => void }) {
  const [revealed, setRevealed] = useState(0)
  const [shuffling, setShuffling] = useState(true)

  // Shuffle phase → reveal phase
  useEffect(() => {
    const shuffleTimer = setTimeout(() => setShuffling(false), 2800)
    return () => clearTimeout(shuffleTimer)
  }, [])

  // Card reveal sequence
  useEffect(() => {
    if (shuffling) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealed(i)
      if (i >= 6) { clearInterval(interval); setTimeout(onDone, 900) }
    }, 650)
    return () => clearInterval(interval)
  }, [shuffling, onDone])

  return (
    <motion.div {...screenIn} className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="text-center mb-8 space-y-2">
        <p className="label-overline" style={{ color: 'var(--gold)' }}>
          {shuffling ? 'Ритуал начался' : revealed >= 6 ? 'Карты раскрыты' : 'Карты открываются'}
        </p>
        <h2 className="font-serif font-light" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          {shuffling ? 'Колода перемешивается' : 'Шесть карт расклада'}
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {shuffling ? (
          <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}>
            <MiniShuffle />
          </motion.div>
        ) : (
          <motion.div key="cards" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {DEMO_CARDS.map((card, i) => (
                <DemoCard key={card.id} card={card} index={i} isRevealed={i < revealed} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MiniShuffle() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-24 h-36">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.div key={i} className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(160deg, #152030 0%, #1C2C40 50%, #152030 100%)',
              border: '1px solid rgba(212,149,74,0.12)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            initial={{ y: -i * 1.5 }}
            animate={{
              x: [0, (i % 2 === 0 ? 1 : -1) * (12 + i * 3), 0, (i % 2 === 0 ? -1 : 1) * (8 + i * 2), 0],
              y: [-i * 1.5, -i * 1.5 - 6, -i * 1.5 + 3, -i * 1.5 - 3, -i * 1.5],
              rotate: [0, (i % 2 === 0 ? 2.5 : -2.5), 0, (i % 2 === 0 ? -1.5 : 1.5), 0],
            }}
            transition={{ duration: 1.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 }}>
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ color: 'rgba(212,149,74,0.2)', fontSize: '1.2rem' }}>✦</span>
            </div>
          </motion.div>
        ))}
        <motion.div className="absolute -inset-4 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,149,74,0.10) 0%, transparent 70%)' }} />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }} />
        ))}
      </div>
    </div>
  )
}

function DemoCard({ card, index, isRevealed }: {
  card: typeof DEMO_CARDS[0]; index: number; isRevealed: boolean
}) {
  const label = SPREAD_LABELS[SPREAD_ORDER[index]]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative" style={{ perspective: '600px' }}>
      <motion.div
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full" style={{ aspectRatio: '2.5/4', transformStyle: 'preserve-3d' }}>
        {/* Back */}
        <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(160deg, #152030 0%, #1C2C40 50%, #152030 100%)',
            border: '1px solid rgba(212,149,74,0.18)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
          <span style={{ color: 'rgba(212,149,74,0.3)', fontSize: '1rem' }}>✦</span>
          <p className="font-sans text-[0.45rem] uppercase tracking-[0.12em] mt-1" style={{ color: 'var(--text-muted)' }}>
            {label.ru}
          </p>
        </div>
        {/* Face */}
        <div className="absolute inset-0 rounded-xl flex flex-col items-center justify-between p-2.5"
          style={{
            backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
            background: 'linear-gradient(170deg, #1E2A3A 0%, #14202E 100%)',
            border: '1px solid rgba(212,149,74,0.35)',
            boxShadow: '0 4px 24px rgba(212,149,74,0.12)',
          }}>
          <p className="font-sans text-[0.4rem] uppercase tracking-[0.12em] w-full text-center" style={{ color: 'var(--text-muted)' }}>
            {label.ru}
          </p>
          <div className="flex flex-col items-center justify-center text-center space-y-0.5 flex-1">
            <span style={{ color: 'var(--gold)', fontSize: '1.3rem', lineHeight: 1 }}>
              {MAJOR_SYMBOLS[card.id] || '✦'}
            </span>
            <span className="font-serif text-[0.5rem] font-light" style={{ color: 'rgba(212,149,74,0.5)' }}>
              {ROMAN[card.id]}
            </span>
            <p className="font-serif font-medium leading-tight px-1"
              style={{ fontSize: '0.65rem', color: 'var(--gold)' }}>
              {card.nameRu}
            </p>
          </div>
          <p className="font-sans text-[0.4rem] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Прямая
          </p>
        </div>
      </motion.div>
      {isRevealed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,149,74,0.15) 0%, transparent 70%)' }} />
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — RESULT
// ═══════════════════════════════════════════════════════════════════════════════

function ResultScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div {...screenIn} className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-sm w-full space-y-8 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="label-overline mb-3" style={{ color: 'var(--gold)' }}>Ваш инсайт</p>
          <blockquote className="font-serif font-light italic leading-relaxed"
            style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>
            &ldquo;{DEMO_INSIGHT}&rdquo;
          </blockquote>
        </motion.div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }}
          className="gold-rule" />

        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="font-sans text-sm leading-[1.8] text-left"
          style={{ color: 'var(--text-secondary)' }}>
          {DEMO_TEXT}
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
          className="pt-2">
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onContinue}
            className="rounded-2xl px-10 py-3.5 font-sans text-sm font-medium"
            style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 20px rgba(212,149,74,0.18)' }}>
            Получить полный разбор
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — SIGNUP / CONVERSION
// ═══════════════════════════════════════════════════════════════════════════════

function SignupScreen({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <motion.div {...screenIn} className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mx-auto max-w-sm w-full space-y-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ border: '1px solid rgba(212,149,74,0.3)', background: 'rgba(212,149,74,0.06)' }}>
          <span style={{ color: 'var(--gold)', fontSize: '1.25rem' }}>✦</span>
        </motion.div>

        <div className="space-y-2">
          <h2 className="font-serif font-light" style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
            Ваш персональный
            <br />разбор готов
          </h2>
          <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
            Продолжите, чтобы получить полный ответ
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Email */}
          <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/register')}
            className="w-full rounded-2xl px-6 py-4 font-sans text-sm font-medium transition-all"
            style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 20px rgba(212,149,74,0.18)' }}>
            Продолжить по email
          </motion.button>

          {/* Apple */}
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl px-6 py-3.5 font-sans text-sm transition-all flex items-center justify-center gap-2"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
            <span style={{ fontSize: '1.1rem' }}></span>
            Войти через Apple
          </motion.button>

          {/* Google */}
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl px-6 py-3.5 font-sans text-sm transition-all flex items-center justify-center gap-2"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
            <span style={{ fontSize: '0.9rem' }}>G</span>
            Войти через Google
          </motion.button>
        </div>

        <p className="font-sans text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
          Уже есть аккаунт?{' '}
          <button onClick={() => router.push('/login')}
            className="underline transition-opacity hover:opacity-60" style={{ color: 'var(--gold)' }}>
            Войти
          </button>
        </p>
      </div>
    </motion.div>
  )
}
