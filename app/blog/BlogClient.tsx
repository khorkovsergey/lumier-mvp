'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition, staggerNormal, revealNormal, revealHero, revealSubtle } from '@/shared/animations/variants'
import Link from 'next/link'

interface Article {
  id: string
  slug: string | null
  title: string
  preview: string
  category: string
  readTime: number
  createdAt: Date | string
  author?: { name: string } | null
}

export function BlogClient({ articles, categories }: {
  articles: Article[]
  categories: Record<string, string>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('cat') || 'all'
  const [active, setActive] = useState(initialCat)

  const usedCategories = Array.from(new Set(articles.map(a => a.category)))
  const tabs = ['all', ...usedCategories]

  const filtered = active === 'all' ? articles : articles.filter(a => a.category === active)
  const featured = filtered[0]
  const rest = filtered.slice(1)

  function articleUrl(a: Article) {
    return `/blog/${a.slug || a.id}`
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Nav */}
      <nav className="glass sticky top-0 z-20 px-6 md:px-12 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
          Lumier
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/insights" className="font-sans text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>Прогнозы</Link>
          <Link href="/tarot" className="font-sans text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>AI Таро</Link>
          <Link href="/register" className="font-sans text-xs rounded-full px-3 py-1"
            style={{ border: '1px solid rgba(212,149,74,0.25)', color: 'var(--gold)' }}>
            Регистрация
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-xl md:max-w-4xl px-6 md:px-12 pb-16">

        {/* Header */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="pt-10 md:pt-16 pb-8 md:pb-12">
          <motion.p variants={revealSubtle} className="label-overline mb-3" style={{ color: 'var(--gold)' }}>
            Блог
          </motion.p>
          <motion.h1 variants={revealHero} className="font-serif font-light leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-primary)' }}>
            Инсайты и <span style={{ color: 'var(--gold)' }}>глубинная аналитика</span>
          </motion.h1>
          <motion.p variants={revealNormal} className="font-sans text-sm md:text-base mt-3 max-w-lg"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Статьи об AI, экспертной практике и инструментах для ясности
          </motion.p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-none -mx-1 px-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActive(tab)}
              className="flex-shrink-0 rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all"
              style={{
                background: tab === active ? 'var(--gold)' : 'var(--bg-raised)',
                color: tab === active ? '#0E1520' : 'var(--text-secondary)',
                border: tab === active ? 'none' : '1px solid var(--border-subtle)',
              }}>
              {tab === 'all' ? 'Все' : categories[tab] || tab}
            </button>
          ))}
        </div>

        {/* Featured article */}
        {featured && (
          <motion.article variants={revealNormal} initial="hidden" animate="visible" className="mb-8">
            <Link href={articleUrl(featured)}>
              <div className="rounded-2xl p-6 md:p-8 transition-all hover:translate-y-[-2px]"
                style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="rounded-full px-3 py-1 font-sans text-xs font-medium"
                    style={{ background: 'rgba(212,149,74,0.12)', color: 'var(--gold)' }}>
                    {categories[featured.category] || featured.category}
                  </span>
                  <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                    {featured.readTime} мин чтения
                  </span>
                </div>
                <h2 className="font-serif font-light leading-snug mb-3"
                  style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: 'var(--text-primary)' }}>
                  {featured.title}
                </h2>
                <p className="font-sans text-sm md:text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {featured.preview}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-medium" style={{ color: 'var(--gold)' }}>Читать →</span>
                  {featured.author && (
                    <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{featured.author.name}</span>
                  )}
                </div>
              </div>
            </Link>
          </motion.article>
        )}

        {/* Article grid */}
        {rest.length > 0 && (
          <motion.div variants={staggerNormal} initial="hidden" animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rest.map(article => (
              <motion.article key={article.id} variants={revealNormal}>
                <Link href={articleUrl(article)}>
                  <div className="rounded-xl p-5 h-full transition-all hover:translate-y-[-1px]"
                    style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-sans text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                        {categories[article.category] || article.category}
                      </span>
                      <span style={{ color: 'var(--border-default)' }}>·</span>
                      <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(article.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="font-serif text-base md:text-lg font-medium leading-snug mb-2" style={{ color: 'var(--text-primary)' }}>
                      {article.title}
                    </h3>
                    <p className="font-sans text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {article.preview}
                    </p>
                    <p className="font-sans text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{article.readTime} мин →</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}

        {articles.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-xl font-light" style={{ color: 'var(--text-muted)' }}>Статьи скоро появятся</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
