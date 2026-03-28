'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition, staggerNormal, revealNormal, revealHero, revealSubtle } from '@/shared/animations/variants'
import { ARTICLE_CATEGORIES } from '../InsightsClient'

interface Insight {
  id: string
  title: string
  preview: string
  content: string
  category: string
  readTime: number
  createdAt: Date | string
  author?: { name: string } | null
}

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      return (
        <h2 key={i} className="font-serif font-light mt-8 mb-3" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          {line.slice(2, -2)}
        </h2>
      )
    }
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    if (boldLine !== line) {
      return (
        <p
          key={i}
          className="font-sans text-base mb-4"
          style={{ lineHeight: 1.85, color: 'var(--text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: boldLine }}
        />
      )
    }
    if (line === '') return <div key={i} className="h-2" />
    return (
      <p key={i} className="font-sans text-base mb-4" style={{ lineHeight: 1.85, color: 'var(--text-secondary)' }}>
        {line}
      </p>
    )
  })
}

export function InsightDetailClient({ insight }: { insight: Insight }) {
  const router = useRouter()

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Навигация */}
      <div
        className="sticky top-0 z-10 glass px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-lg md:max-w-3xl flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Статьи
          </button>
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            {insight.readTime} мин чтения
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg md:max-w-3xl px-6">
        {/* Заголовок */}
        <motion.div
          variants={staggerNormal}
          initial="hidden"
          animate="visible"
          className="pt-10 pb-8 space-y-4"
        >
          <motion.div variants={revealSubtle} className="flex items-center gap-3">
            <span
              className="label-overline rounded-full px-3 py-1"
              style={{ background: 'rgba(196,150,74,0.1)', color: 'var(--gold)', fontSize: '0.625rem' }}
            >
              {ARTICLE_CATEGORIES[insight.category] || insight.category}
            </span>
            <span style={{ color: 'var(--border-default)' }}>·</span>
            <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(insight.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </motion.div>

          <motion.h1
            variants={revealHero}
            className="font-serif font-light leading-tight"
            style={{ fontSize: '2.25rem', color: 'var(--text-primary)' }}
          >
            {insight.title}
          </motion.h1>

          <motion.p
            variants={revealNormal}
            className="font-sans text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {insight.preview}
          </motion.p>

          {insight.author && (
            <motion.p variants={revealSubtle} className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              Автор: {insight.author.name}
            </motion.p>
          )}

          <motion.div variants={revealSubtle}>
            <div className="gold-rule" />
          </motion.div>
        </motion.div>

        {/* Тело статьи */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-16"
        >
          {renderContent(insight.content)}

          <div className="gold-rule mt-10" />

          {/* Призыв к действию */}
          <div
            className="mt-10 rounded-2xl p-6 text-center space-y-3"
            style={{
              background: 'var(--bg-float)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p className="font-serif font-light" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Готовы исследовать глубже?
            </p>
            <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
              Личный расклад поместит эти идеи в контекст вашей ситуации.
            </p>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/question')}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-sans text-sm font-medium transition-colors"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-base)' }}
            >
              Начать расклад ✦
            </motion.button>
          </div>
        </motion.article>
      </div>
    </motion.div>
  )
}
