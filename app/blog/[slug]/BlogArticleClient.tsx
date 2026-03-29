'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition, staggerNormal, revealNormal, revealHero, revealSubtle } from '@/shared/animations/variants'
import Link from 'next/link'

interface Article {
  id: string; slug: string | null; title: string; preview: string; content: string
  category: string; readTime: number; createdAt: Date | string
  author?: { name: string } | null
}

interface Related {
  id: string; slug: string | null; title: string; preview: string; category: string; readTime: number
}

const CATS: Record<string, string> = {
  ai: 'AI и технологии', experts: 'Эксперты', results: 'Результаты',
  tarot: 'Таро', astrology: 'Астрология', growth: 'Рост', general: 'Общее',
  practice: 'Практика', guide: 'Руководство', insight: 'Откровение',
  forecast: 'Прогнозы', numerology: 'Нумерология',
}

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      return <h2 key={i} className="font-serif font-light mt-8 mb-3" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{line.slice(2, -2)}</h2>
    }
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    if (boldLine !== line) {
      return <p key={i} className="font-sans text-base md:text-lg mb-4" style={{ lineHeight: 1.85, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: boldLine }} />
    }
    if (line === '') return <div key={i} className="h-2" />
    return <p key={i} className="font-sans text-base md:text-lg mb-4" style={{ lineHeight: 1.85, color: 'var(--text-secondary)' }}>{line}</p>
  })
}

export function BlogArticleClient({ article, related }: { article: Article; related: Related[] }) {
  const router = useRouter()

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Nav */}
      <nav className="glass sticky top-0 z-10 px-6 md:px-12 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/blog" className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
          ← Блог
        </Link>
        <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{article.readTime} мин чтения</span>
      </nav>

      <article className="mx-auto max-w-lg md:max-w-2xl px-6 md:px-12">
        {/* Header */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="pt-10 md:pt-16 pb-8 space-y-4">
          <motion.div variants={revealSubtle} className="flex items-center gap-3">
            <span className="rounded-full px-3 py-1 font-sans text-xs font-medium"
              style={{ background: 'rgba(212,149,74,0.12)', color: 'var(--gold)' }}>
              {CATS[article.category] || article.category}
            </span>
            <span style={{ color: 'var(--border-default)' }}>·</span>
            <span className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Date(article.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </motion.div>

          <motion.h1 variants={revealHero} className="font-serif font-light leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)' }}>
            {article.title}
          </motion.h1>

          <motion.p variants={revealNormal} className="font-sans text-base md:text-lg leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            {article.preview}
          </motion.p>

          {article.author && (
            <motion.p variants={revealSubtle} className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              Автор: {article.author.name}
            </motion.p>
          )}

          <motion.div variants={revealSubtle} className="gold-rule" />
        </motion.div>

        {/* Body */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="pb-12">
          {renderContent(article.content)}
        </motion.div>

        <div className="gold-rule" />

        {/* CTA */}
        <div className="py-10 text-center space-y-4"
          style={{ background: 'var(--bg-float)', borderRadius: '20px', border: '1px solid var(--border-subtle)', margin: '2rem 0' }}>
          <p className="font-serif font-light" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            Хотите получить персональный инсайт?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-6">
            <Link href="/tarot">
              <motion.span whileHover={{ y: -2 }} className="inline-block rounded-xl px-6 py-3 font-sans text-sm font-medium"
                style={{ background: 'var(--gold)', color: '#0E1520' }}>
                AI-расклад Таро
              </motion.span>
            </Link>
            <Link href="/register">
              <motion.span whileHover={{ y: -1 }} className="inline-block rounded-xl px-6 py-3 font-sans text-sm"
                style={{ border: '1px solid rgba(212,149,74,0.20)', color: 'var(--gold)' }}>
                Консультация с экспертом
              </motion.span>
            </Link>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="py-10">
            <p className="label-overline mb-4" style={{ color: 'var(--text-muted)' }}>Похожие статьи</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {related.map(r => (
                <Link key={r.id} href={`/blog/${r.slug || r.id}`}>
                  <div className="rounded-xl p-4 h-full transition-all hover:translate-y-[-1px]"
                    style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                    <p className="font-sans text-[0.6rem] uppercase tracking-wider mb-1" style={{ color: 'var(--gold)' }}>
                      {CATS[r.category] || r.category}
                    </p>
                    <p className="font-serif text-sm font-medium leading-snug mb-1" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                    <p className="font-sans text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{r.preview}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </motion.div>
  )
}
