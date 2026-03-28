'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  pageTransition,
  staggerNormal,
  revealNormal,
  revealHero,
  revealSubtle,
} from '@/shared/animations/variants'

export const ARTICLE_CATEGORIES: Record<string, string> = {
  forecast:   'Прогнозы',
  astrology:  'Астрология',
  tarot:      'Таро',
  numerology: 'Нумерология',
  practice:   'Практика',
  guide:      'Руководство',
  insight:    'Откровение',
  general:    'Общее',
}

interface Article {
  id: string
  title: string
  preview: string
  category: string
  readTime: number
  createdAt: Date | string
  author?: { name: string } | null
}

interface Props {
  articles: Article[]
}

export function InsightsClient({ articles }: Props) {
  const router = useRouter()
  const [active, setActive] = useState('all')

  const usedCategories = Array.from(new Set(articles.map((a) => a.category)))
  const tabs = ['all', ...usedCategories]

  const filtered = active === 'all' ? articles : articles.filter((a) => a.category === active)
  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Шапка */}
      <div
        className="sticky top-0 z-20 glass"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-xl md:max-w-3xl px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Назад
          </button>
          <p className="font-serif text-base font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Lumier
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-xl md:max-w-3xl px-6">
        {/* Заголовок раздела */}
        <motion.div
          variants={staggerNormal}
          initial="hidden"
          animate="visible"
          className="pt-10 pb-6 space-y-3"
        >
          <motion.p variants={revealSubtle} className="label-overline" style={{ color: 'var(--gold)' }}>
            Эксперты Lumier
          </motion.p>
          <motion.h1
            variants={revealHero}
            className="font-serif font-light leading-tight"
            style={{ fontSize: '2.25rem', color: 'var(--text-primary)' }}
          >
            Новости и прогнозы
            <br />
            <span style={{ color: 'var(--gold)' }}>событий</span>
          </motion.h1>
          <motion.p variants={revealNormal} className="font-sans text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Астрологические прогнозы, таро-расклады на сезон и аналитика от наших мастеров.
          </motion.p>
        </motion.div>

        {/* Категории */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none -mx-1 px-1">
          {tabs.map((tab) => {
            const isActive = tab === active
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className="flex-shrink-0 rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all"
                style={{
                  background: isActive ? 'var(--gold)' : 'var(--bg-raised)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid transparent' : '1px solid var(--border-subtle)',
                }}
              >
                {tab === 'all' ? 'Все' : ARTICLE_CATEGORIES[tab] || tab}
              </button>
            )
          })}
        </div>

        {/* Контент */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-serif text-xl font-light" style={{ color: 'var(--text-muted)' }}>
                  Статей пока нет
                </p>
                <p className="font-sans text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Загляните позже
                </p>
              </div>
            )}

            {/* Главная статья */}
            {featured && (
              <motion.div
                variants={revealNormal}
                initial="hidden"
                animate="visible"
                className="mb-4"
              >
                <FeaturedCard article={featured} onClick={() => router.push(`/insights/${featured.id}`)} />
              </motion.div>
            )}

            {/* Список остальных */}
            {rest.length > 0 && (
              <motion.div
                variants={staggerNormal}
                initial="hidden"
                animate="visible"
                className="space-y-3 pb-12"
              >
                {rest.map((article) => (
                  <motion.div key={article.id} variants={revealNormal}>
                    <ArticleCard
                      article={article}
                      onClick={() => router.push(`/insights/${article.id}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function FeaturedCard({ article, onClick }: { article: Article; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(196,150,74,0.12)' }}
      whileTap={{ scale: 0.99 }}
      className="cursor-pointer rounded-2xl p-6 space-y-4"
      style={{
        background: 'var(--bg-float)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,150,74,0.05) 0%, transparent 70%)' }}
      />

      <div className="flex items-center justify-between">
        <span
          className="label-overline rounded-full px-3 py-1"
          style={{
            background: 'rgba(196,150,74,0.1)',
            color: 'var(--gold)',
            fontSize: '0.625rem',
          }}
        >
          {ARTICLE_CATEGORIES[article.category] || article.category}
        </span>
        <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
          {article.readTime} мин чтения
        </span>
      </div>

      <div>
        <h2
          className="font-serif font-light leading-snug mb-2"
          style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}
        >
          {article.title}
        </h2>
        <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {article.preview}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--gold)' }}>
          <span className="font-sans text-xs font-medium">Читать</span>
          <span className="text-sm">→</span>
        </div>
        {article.author && (
          <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            {article.author.name}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      className="cursor-pointer flex items-start gap-4 rounded-xl px-4 py-4"
      style={{
        background: 'var(--bg-float)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex-shrink-0 pt-0.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mt-1.5"
          style={{ background: 'var(--gold)' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="font-sans text-xs uppercase tracking-wider"
            style={{ color: 'var(--gold)', fontSize: '0.6rem', letterSpacing: '0.1em' }}
          >
            {ARTICLE_CATEGORIES[article.category] || article.category}
          </span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date(article.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <h3 className="font-serif font-medium leading-snug mb-1" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
          {article.title}
        </h3>
        <p className="font-sans text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {article.preview}
        </p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{article.readTime}м</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>→</span>
      </div>
    </motion.div>
  )
}
