import { prisma } from '@/shared/lib/prisma'
import { BlogArticleClient } from './BlogArticleClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

// ─── SEO metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await findArticle(params.slug)
  if (!article) return { title: 'Статья не найдена — Lumier' }

  return {
    title: article.metaTitle || `${article.title} — Lumier`,
    description: article.metaDesc || article.preview,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDesc || article.preview,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
    },
  }
}

// ─── Find by slug or id ───────────────────────────────────────────────────────

async function findArticle(slugOrId: string) {
  // Try slug first, then id
  const bySlug = await prisma.insightArticle.findFirst({
    where: { slug: slugOrId, published: true },
    include: { author: { select: { name: true } } },
  })
  if (bySlug) return bySlug

  return prisma.insightArticle.findFirst({
    where: { id: slugOrId, published: true },
    include: { author: { select: { name: true } } },
  })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = await findArticle(params.slug)
  if (!article) notFound()

  // Related articles (same category, exclude current)
  const related = await prisma.insightArticle.findMany({
    where: { published: true, category: article.category, id: { not: article.id } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, slug: true, title: true, preview: true, category: true, readTime: true },
  })

  return <BlogArticleClient article={article} related={related} />
}
