import { prisma } from '@/shared/lib/prisma'
import { BlogClient } from './BlogClient'
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Блог Lumier — Инсайты, прогнозы и глубинная аналитика',
  description: 'Статьи экспертов Lumier об AI, таро, астрологии, личностном росте и глубинной аналитике. Прогнозы, практики и инструменты для ясности.',
  openGraph: {
    title: 'Блог Lumier — Инсайты и прогнозы',
    description: 'Статьи экспертов об AI, таро и глубинной аналитике',
    type: 'website',
  },
}

const BLOG_CATEGORIES: Record<string, string> = {
  ai: 'AI и технологии',
  experts: 'Эксперты и практика',
  results: 'Истории и результаты',
  tarot: 'Таро',
  astrology: 'Астрология',
  growth: 'Личностный рост',
  general: 'Общее',
}

export default async function BlogPage() {
  const articles = await prisma.insightArticle.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, slug: true, title: true, preview: true, category: true,
      readTime: true, createdAt: true,
      author: { select: { name: true } },
    },
  })

  return (
    <Suspense>
      <BlogClient articles={articles} categories={BLOG_CATEGORIES} />
    </Suspense>
  )
}
