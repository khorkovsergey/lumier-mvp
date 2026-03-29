'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { motion } from 'framer-motion'
import { pageTransition, staggerNormal, revealNormal, revealSubtle } from '@/shared/animations/variants'
import { approveReader, rejectReader, grantAuthorRole, revokeAuthorRole } from '@/server/actions/admin'
import { logout } from '@/server/actions/auth'
import Link from 'next/link'

interface Reader {
  id: string; name: string; specialization: string; phone: string | null
  experience: string | null; methods: string | null; bio: string; about: string | null
  price: number; approvalStatus: string; isActive: boolean; createdAt: string | Date
  user: { id: string; name: string; email: string | null; role?: string }
}

interface Stats { totalUsers: number; totalReaders: number; pendingCount: number; totalReadings: number }

export function AdminDashboardClient({ pending, readers, stats }: {
  pending: Reader[]; readers: Reader[]; stats: Stats
}) {
  const router = useRouter()

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      {/* Header */}
      <div className="glass sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>Lumier</p>
            <p className="label-overline" style={{ color: 'var(--gold)', fontSize: '0.55rem' }}>Администратор</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/news" className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Статьи</Link>
            <Link href="/admin/forecasts" className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Прогнозы</Link>
            <button onClick={async () => { await logout() }} className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Выйти</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">

        {/* Stats */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Пользователей', value: stats.totalUsers, color: 'var(--text-primary)' },
            { label: 'Консультантов', value: stats.totalReaders, color: 'var(--gold)' },
            { label: 'На одобрении', value: stats.pendingCount, color: stats.pendingCount > 0 ? '#F87171' : 'var(--text-muted)' },
            { label: 'AI-раскладов', value: stats.totalReadings, color: '#60B8CE' },
          ].map(s => (
            <motion.div key={s.label} variants={revealNormal}
              className="rounded-xl px-4 py-4 text-center"
              style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
              <p className="font-serif text-2xl font-light" style={{ color: s.color }}>{s.value}</p>
              <p className="label-overline mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pending approvals */}
        {pending.length > 0 && (
          <motion.div variants={staggerNormal} initial="hidden" animate="visible">
            <motion.div variants={revealSubtle} className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: '#F87171' }} />
              <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Ожидают одобрения</p>
            </motion.div>
            <div className="space-y-3">
              {pending.map(r => (
                <motion.div key={r.id} variants={revealNormal}>
                  <PendingCard reader={r} onRefresh={() => router.refresh()} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All readers */}
        <motion.div variants={staggerNormal} initial="hidden" animate="visible">
          <motion.p variants={revealSubtle} className="label-overline mb-3" style={{ color: 'var(--text-muted)' }}>
            Все консультанты
          </motion.p>
          <div className="space-y-2">
            {readers.filter(r => r.approvalStatus === 'APPROVED').map(r => (
              <motion.div key={r.id} variants={revealNormal}>
                <ReaderRow reader={r} onRefresh={() => router.refresh()} />
              </motion.div>
            ))}
            {readers.filter(r => r.approvalStatus === 'APPROVED').length === 0 && (
              <p className="font-sans text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>Нет одобренных консультантов</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function PendingCard({ reader, onRefresh }: { reader: Reader; onRefresh: () => void }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg-float)', border: '1px solid rgba(248,113,113,0.15)' }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-serif text-base font-medium" style={{ color: 'var(--text-primary)' }}>{reader.name}</p>
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{reader.user.email}</p>
        </div>
        <span className="rounded-full px-2 py-0.5 font-sans text-[0.6rem]" style={{ background: 'rgba(248,113,113,0.10)', color: '#F87171' }}>
          На рассмотрении
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <InfoField label="Специализация" value={reader.specialization} />
        <InfoField label="Опыт" value={reader.experience} />
        <InfoField label="Методы" value={reader.methods} />
        <InfoField label="Цена" value={`$${reader.price}`} />
        <InfoField label="Телефон" value={reader.phone} />
      </div>

      <p className="font-sans text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{reader.bio}</p>
      {reader.about && <p className="font-sans text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{reader.about}</p>}

      <div className="flex gap-2">
        <button onClick={() => startTransition(async () => { await approveReader(reader.id); onRefresh() })}
          disabled={isPending}
          className="flex-1 rounded-xl py-2 font-sans text-xs font-medium"
          style={{ background: 'var(--gold)', color: '#0E1520' }}>
          Одобрить
        </button>
        <button onClick={() => startTransition(async () => { await rejectReader(reader.id); onRefresh() })}
          disabled={isPending}
          className="rounded-xl px-4 py-2 font-sans text-xs"
          style={{ background: 'var(--bg-raised)', color: '#F87171', border: '1px solid var(--border-subtle)' }}>
          Отклонить
        </button>
      </div>
    </div>
  )
}

function ReaderRow({ reader, onRefresh }: { reader: Reader; onRefresh: () => void }) {
  const [isPending, startTransition] = useTransition()
  const isAuthor = reader.user.role === 'AUTHOR'

  return (
    <div className="rounded-xl px-4 py-3 flex items-center justify-between"
      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-serif text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{reader.name}</p>
          <span className="rounded-full px-2 py-0.5 font-sans text-[0.55rem]"
            style={{ background: isAuthor ? 'rgba(212,149,74,0.12)' : 'var(--bg-raised)', color: isAuthor ? 'var(--gold)' : 'var(--text-muted)' }}>
            {isAuthor ? 'Автор' : 'Консультант'}
          </span>
        </div>
        <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
          {reader.specialization} · ${reader.price} · {reader.user.email}
        </p>
      </div>
      <button
        onClick={() => startTransition(async () => {
          if (isAuthor) await revokeAuthorRole(reader.user.id)
          else await grantAuthorRole(reader.user.id)
          onRefresh()
        })}
        disabled={isPending}
        className="rounded-lg px-3 py-1.5 font-sans text-xs ml-3"
        style={{ background: 'var(--bg-raised)', color: isAuthor ? '#F87171' : 'var(--gold)', border: '1px solid var(--border-subtle)' }}>
        {isAuthor ? 'Снять автора' : 'Сделать автором'}
      </button>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="font-sans text-[0.6rem] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-sans text-xs" style={{ color: 'var(--text-secondary)' }}>{value || '—'}</p>
    </div>
  )
}
