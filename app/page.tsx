'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { dur, ease } from '@/shared/animations/variants'
import { LifeLinesCanvas } from './LifeLinesCanvas'
import { SPREAD_ORDER, SPREAD_LABELS, MAJOR_SYMBOLS, ROMAN } from '@/entities/tarot'

// ─── Types & Constants ────────────────────────────────────────────────────────

type Screen = 'hero' | 'about-ai' | 'about-experts' | 'signup'

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

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {screen === 'hero' && <LifeLinesCanvas />}

      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 25%, rgba(212,149,74,0.05) 0%, transparent 60%)' }} />

      <div className="relative z-20">
        <AnimatePresence mode="wait">
          {screen === 'hero'          && <HeroScreen      key="hero"     onTry={() => setScreen('about-ai')} router={router} />}
          {screen === 'about-ai'      && <AboutAIScreen   key="ai"       onNext={() => setScreen('about-experts')} />}
          {screen === 'about-experts'  && <AboutExpertsScreen key="exp"   onNext={() => setScreen('signup')} />}
          {screen === 'signup'        && <SignupScreen     key="signup"   router={router} />}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — HERO
// ═══════════════════════════════════════════════════════════════════════════════

function HeroScreen({ onTry, router }: { onTry: () => void; router: ReturnType<typeof useRouter> }) {
  const features = [
    { icon: '◈', title: 'AI нового поколения',      text: 'Передовые модели анализируют контекст вашей ситуации и дают персональные инсайты' },
    { icon: '⚜', title: 'Живые эксперты',            text: 'Реальные консультанты с многолетним опытом, а не скрипты и чат-боты' },
    { icon: '✦', title: 'Настоящие результаты',      text: 'Структурированные разборы, которые помогают увидеть ситуацию с новой стороны' },
  ]

  return (
    <motion.div {...screenIn} className="min-h-screen flex flex-col">

      {/* ── Navigation bar ────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 md:px-12 py-5 flex items-center justify-between"
      >
        <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.08em' }}>
          Lumier
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/login')}
            className="font-sans text-xs transition-opacity hover:opacity-70 hidden sm:block"
            style={{ color: 'var(--text-secondary)' }}>
            Войти
          </button>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/register')}
            className="rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all hidden sm:block"
            style={{ border: '1px solid rgba(212,149,74,0.25)', color: 'var(--gold)' }}>
            Регистрация
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Main content — stacks on mobile, side-by-side on desktop ── */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 px-6 md:px-16 lg:px-24 py-8 md:py-0">

        {/* Left column — Value proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.verySlow, ease: ease.outSoft, delay: 0.4 }}
          className="text-center md:text-left max-w-lg"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-sans text-xs uppercase tracking-[0.18em] mb-4 md:mb-5"
            style={{ color: 'var(--gold)' }}
          >
            Платформа глубинных инсайтов
          </motion.p>

          <h1 className="font-serif font-light leading-[1.08]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'var(--text-primary)' }}>
            Ответы от передовых
            <br />решений AI и лучших
            <br /><span style={{ color: 'var(--gold)' }}>экспертов</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.0 }}
            className="mt-5 font-sans text-sm md:text-base leading-[1.7] max-w-md"
            style={{ color: 'var(--text-secondary)' }}
          >
            Lumier объединяет мощь передового AI, мистические символы
            и&nbsp;опыт живых экспертов — чтобы дать вам ответы
            в&nbsp;моменты, когда они важнее всего
          </motion.p>

          {/* CTA buttons — below text on all screens */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 mt-8 max-w-sm md:max-w-none"
          >
            <motion.button whileHover={{ y: -2, boxShadow: '0 0 36px rgba(212,149,74,0.28)' }}
              whileTap={{ scale: 0.97 }} onClick={onTry}
              className="rounded-2xl px-8 py-4 font-sans text-sm font-medium transition-all sm:w-auto w-full"
              style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 24px rgba(212,149,74,0.20)' }}>
              Узнать больше
            </motion.button>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/register')}
              className="rounded-2xl px-8 py-3.5 font-sans text-sm font-medium transition-all sm:w-auto w-full"
              style={{ background: 'var(--bg-float)', border: '1px solid rgba(212,149,74,0.20)', color: 'var(--gold)' }}>
              Зарегистрироваться
            </motion.button>
          </motion.div>

          {/* Mobile-only login link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
            className="mt-4 font-sans text-xs sm:hidden"
            style={{ color: 'var(--text-muted)' }}
          >
            Уже есть аккаунт?{' '}
            <button onClick={() => router.push('/login')}
              className="transition-opacity hover:opacity-60" style={{ color: 'var(--gold)' }}>Войти</button>
          </motion.p>
        </motion.div>

        {/* Right column — Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="space-y-3 w-full max-w-xs md:max-w-sm"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + i * 0.15 }}
              className="rounded-xl px-5 py-4 md:py-5"
              style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--gold)', fontSize: '1rem' }}>{f.icon}</span>
                <div>
                  <p className="font-sans text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                  <p className="font-sans text-xs leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>{f.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — ABOUT AI (with inline demo spread)
// ═══════════════════════════════════════════════════════════════════════════════

function AboutAIScreen({ onNext }: { onNext: () => void }) {
  const [demoStep, setDemoStep] = useState<'idle' | 'shuffle' | 'reveal' | 'done'>('idle')
  const [demoQ, setDemoQ] = useState('')
  const [revealed, setRevealed] = useState(0)

  // Shuffle → reveal sequence
  useEffect(() => {
    if (demoStep !== 'shuffle') return
    const t = setTimeout(() => setDemoStep('reveal'), 2400)
    return () => clearTimeout(t)
  }, [demoStep])

  useEffect(() => {
    if (demoStep !== 'reveal') return
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealed(i)
      if (i >= 6) { clearInterval(interval); setTimeout(() => setDemoStep('done'), 600) }
    }, 550)
    return () => clearInterval(interval)
  }, [demoStep])

  const AI_PARAGRAPHS = [
    'Мы используем Искусственный Интеллект последних поколений — систему, которая развивается вместе с каждым новым технологическим прорывом и постоянно обновляется, чтобы оставаться на переднем крае возможностей. Это не статичный алгоритм, а живая архитектура понимания, способная работать с тем, что выходит за пределы очевидного.',
    'В основе лежит обучение на многослойных источниках: от современных моделей обработки смысла до символических систем, сформированных веками и архетипических образов.',
    'Наш AI не ищет совпадения — он распознаёт закономерности, которые невозможно увидеть напрямую. Он связывает символы, контекст и скрытые сигналы в единую картину, позволяя почувствовать смысл раньше, чем он становится очевидным.',
    'Это новый уровень работы с пониманием — там, где технология начинает говорить на языке смыслов.',
  ]

  return (
    <motion.div {...screenIn} className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 md:px-12 py-5 flex items-center justify-between">
        <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.08em' }}>Lumier</p>
        <button onClick={onNext} className="font-sans text-xs transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
          Далее →
        </button>
      </nav>

      <div className="flex-1 px-6 md:px-12 lg:px-24 pb-12 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-10 md:mb-14">
            <p className="label-overline mb-3" style={{ color: 'var(--gold)' }}>Технология</p>
            <h2 className="font-serif font-light leading-[1.1]"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}>
              Искусственный интеллект,
              <br />который <span style={{ color: 'var(--gold)' }}>понимает смысл</span>
            </h2>
          </motion.div>

          {/* Two-column on desktop: text left, demo right */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Text */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex-1 space-y-4">
              {AI_PARAGRAPHS.map((p, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="font-sans text-sm md:text-base leading-[1.8]"
                  style={{ color: 'var(--text-secondary)' }}>
                  {p}
                </motion.p>
              ))}
            </motion.div>

            {/* Inline demo */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full md:w-[340px] flex-shrink-0">
              <div className="rounded-2xl p-5 md:p-6 space-y-4"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
                <p className="label-overline" style={{ color: 'var(--gold)' }}>Попробуйте прямо сейчас</p>

                {/* Question input */}
                {demoStep === 'idle' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <textarea value={demoQ} onChange={(e) => setDemoQ(e.target.value)}
                      placeholder="Что вас сейчас волнует?"
                      rows={2} maxLength={200}
                      className="w-full rounded-xl px-4 py-3 font-sans text-xs outline-none resize-none"
                      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', lineHeight: 1.7 }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(212,149,74,0.4)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)' }}
                    />
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => setDemoStep('shuffle')}
                      className="w-full rounded-xl py-2.5 font-sans text-xs font-medium"
                      style={{ background: 'var(--gold)', color: '#0E1520' }}>
                      Раскрыть карты ✦
                    </motion.button>
                  </motion.div>
                )}

                {/* Shuffle */}
                {demoStep === 'shuffle' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-6 gap-4">
                    <div className="relative w-16 h-24">
                      {Array.from({ length: 8 }, (_, i) => (
                        <motion.div key={i} className="absolute inset-0 rounded-lg"
                          style={{ background: 'linear-gradient(160deg, #152030 0%, #1C2C40 100%)', border: '1px solid rgba(212,149,74,0.12)' }}
                          animate={{
                            x: [0, (i % 2 === 0 ? 8 : -8), 0, (i % 2 === 0 ? -6 : 6), 0],
                            y: [-i, -i - 4, -i + 2, -i - 2, -i],
                            rotate: [0, (i % 2 === 0 ? 2 : -2), 0],
                          }}
                          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.05 }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <span style={{ color: 'rgba(212,149,74,0.2)', fontSize: '0.8rem' }}>✦</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Перемешиваю колоду...</p>
                  </motion.div>
                )}

                {/* Card reveal */}
                {(demoStep === 'reveal' || demoStep === 'done') && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="grid grid-cols-3 gap-1.5">
                      {DEMO_CARDS.map((card, i) => {
                        const isRev = i < revealed
                        const label = SPREAD_LABELS[SPREAD_ORDER[i]]
                        return (
                          <motion.div key={card.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className="rounded-lg text-center py-2 px-1"
                            style={{
                              background: isRev ? 'var(--bg-float)' : 'var(--bg-base)',
                              border: isRev ? '1px solid rgba(212,149,74,0.25)' : '1px solid var(--border-subtle)',
                              transition: 'all 0.4s',
                            }}>
                            {isRev ? (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>
                                  {MAJOR_SYMBOLS[card.id]}
                                </span>
                                <p className="font-serif text-[0.5rem] font-medium mt-0.5" style={{ color: 'var(--gold)' }}>
                                  {card.nameRu}
                                </p>
                              </motion.div>
                            ) : (
                              <div>
                                <span style={{ color: 'rgba(212,149,74,0.2)', fontSize: '0.7rem' }}>✦</span>
                                <p className="font-sans text-[0.4rem] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label.ru}</p>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Demo result */}
                    {demoStep === 'done' && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }} className="mt-4 space-y-2">
                        <div className="gold-rule" />
                        <p className="font-serif text-xs font-light italic leading-relaxed"
                          style={{ color: 'var(--text-primary)' }}>
                          &ldquo;{DEMO_INSIGHT}&rdquo;
                        </p>
                        <p className="font-sans text-[0.65rem] leading-[1.7]" style={{ color: 'var(--text-muted)' }}>
                          Зарегистрируйтесь для полного разбора
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Next button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-12 text-center">
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onNext}
              className="rounded-2xl px-10 py-3.5 font-sans text-sm font-medium"
              style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 20px rgba(212,149,74,0.18)' }}>
              Об экспертах →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — ABOUT EXPERTS
// ═══════════════════════════════════════════════════════════════════════════════

function AboutExpertsScreen({ onNext }: { onNext: () => void }) {
  const EXPERT_PARAGRAPHS = [
    'Наши эксперты — это специалисты высшего уровня с многолетним опытом и глубокой практикой, отобранные не по количеству, а по качеству. Мы сознательно строим не массовый сервис, а пространство точечной, внимательной работы с каждым запросом.',
    'Здесь нет потоковых консультаций и универсальных ответов. Каждый запрос рассматривается как уникальная ситуация, требующая индивидуального подхода, глубины и точности. Эксперты работают не по шаблонам — они вникают в контекст, улавливают нюансы и дают разбор, который действительно относится именно к вам.',
    'Вы можете выбрать эксперта по направлению и уровню опыта — того, кто максимально точно соответствует вашему запросу. Доступны два формата: общение в режиме реального времени, когда вы получаете живой диалог и мгновенную обратную связь, или письменная консультация, в которой эксперт в течение 24–48 часов подготовит подробный, выверенный разбор.',
    'Это премиальный формат, где важна не скорость и не масштаб, а качество, внимание и глубина работы с каждой отдельной ситуацией.',
  ]

  const formats = [
    { icon: '◇', title: 'Живой диалог', desc: 'Общение в реальном времени с мгновенной обратной связью' },
    { icon: '◈', title: 'Письменный разбор', desc: 'Подробная консультация за 24–48 часов' },
  ]

  return (
    <motion.div {...screenIn} className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="px-6 md:px-12 py-5 flex items-center justify-between">
        <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.08em' }}>Lumier</p>
        <button onClick={onNext} className="font-sans text-xs transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
          Регистрация →
        </button>
      </nav>

      <div className="flex-1 px-6 md:px-12 lg:px-24 pb-12 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-10 md:mb-14">
            <p className="label-overline mb-3" style={{ color: 'var(--gold)' }}>Эксперты</p>
            <h2 className="font-serif font-light leading-[1.1]"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}>
              Живые специалисты,
              <br /><span style={{ color: 'var(--gold)' }}>а не алгоритмы</span>
            </h2>
          </motion.div>

          {/* Content */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Text */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex-1 space-y-4">
              {EXPERT_PARAGRAPHS.map((p, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="font-sans text-sm md:text-base leading-[1.8]"
                  style={{ color: 'var(--text-secondary)' }}>
                  {p}
                </motion.p>
              ))}
            </motion.div>

            {/* Format cards */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full md:w-[320px] flex-shrink-0 space-y-4">
              <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Форматы работы</p>
              {formats.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.15 }}
                  className="rounded-xl px-5 py-5"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5" style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>{f.icon}</span>
                    <div>
                      <p className="font-sans text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                      <p className="font-sans text-xs leading-[1.6]" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Quality badge */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
                className="rounded-xl px-5 py-4 text-center"
                style={{ background: 'rgba(212,149,74,0.06)', border: '1px solid rgba(212,149,74,0.15)' }}>
                <p className="font-serif text-sm font-light italic" style={{ color: 'var(--gold)' }}>
                  Качество, внимание и глубина — в каждой консультации
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
            className="mt-12 text-center">
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onNext}
              className="rounded-2xl px-10 py-4 font-sans text-sm font-medium"
              style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 24px rgba(212,149,74,0.20)' }}>
              Зарегистрироваться
            </motion.button>
          </motion.div>
        </div>
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
            Готовы открыть
            <br />для себя новое?
          </h2>
          <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
            Получи 1 бесплатное предсказание от самого передового AI
          </p>
        </div>

        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/register')}
          className="w-full rounded-2xl px-6 py-4 font-sans text-sm font-medium transition-all mt-2"
          style={{ background: 'var(--gold)', color: '#0E1520', boxShadow: '0 0 20px rgba(212,149,74,0.18)' }}>
          Зарегистрироваться
        </motion.button>

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
