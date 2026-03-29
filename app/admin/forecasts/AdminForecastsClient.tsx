'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition } from '@/shared/animations/variants'
import {
  createWeeklyInsight, createGlobalForecast, createCalendarEvent,
  createBreakingInsight, createAiForecast, createForecastAccuracy,
  deleteForecastItem,
} from '@/server/actions/admin-forecasts'
import { adminAddLikes } from '@/server/actions/forecasts'

type Tab = 'weekly' | 'global' | 'calendar' | 'breaking' | 'ai' | 'accuracy'

const TABS: { id: Tab; label: string }[] = [
  { id: 'weekly', label: 'Недельный' },
  { id: 'global', label: 'Глобальные' },
  { id: 'calendar', label: 'Календарь' },
  { id: 'breaking', label: 'Срочные' },
  { id: 'ai', label: 'AI' },
  { id: 'accuracy', label: 'Точность' },
]

export function AdminForecastsClient({ data }: { data: any }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('weekly')
  const [isPending, startTransition] = useTransition()
  const [boostId, setBoostId] = useState('')
  const [boostCount, setBoostCount] = useState('10')

  function handleDelete(id: string, type: string) {
    if (!confirm('Удалить?')) return
    startTransition(async () => {
      await deleteForecastItem(id, type)
      router.refresh()
    })
  }

  function handleBoost(targetId: string, targetType: string) {
    startTransition(async () => {
      await adminAddLikes(targetId, targetType, Number(boostCount) || 10)
      router.refresh()
    })
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="min-h-screen" style={{ background: 'var(--bg-base)' }}>

      <div className="glass sticky top-0 z-10 px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <p className="label-overline" style={{ color: 'var(--gold)' }}>Администратор</p>
            <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)' }}>Прогнозы и события</p>
          </div>
          <button onClick={() => router.push('/admin/news')} className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            Статьи →
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-shrink-0 rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all"
              style={{
                background: t.id === tab ? 'var(--gold)' : 'var(--bg-raised)',
                color: t.id === tab ? '#0E1520' : 'var(--text-secondary)',
                border: t.id === tab ? 'none' : '1px solid var(--border-subtle)',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Forms */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
          <p className="label-overline mb-4" style={{ color: 'var(--gold)' }}>Создать: {TABS.find(t => t.id === tab)?.label}</p>

          {tab === 'weekly' && <FormFields action={createWeeklyInsight} fields={[
            { name: 'title', placeholder: 'Заголовок' },
            { name: 'content', placeholder: 'Содержимое (1-2 абзаца)', textarea: true },
            { name: 'tone', placeholder: 'Тон (напряжение, рост, перемены...)' },
            { name: 'weekStart', placeholder: 'Начало недели', type: 'date' },
          ]} />}

          {tab === 'global' && <FormFields action={createGlobalForecast} fields={[
            { name: 'title', placeholder: 'Заголовок' },
            { name: 'content', placeholder: 'Прогноз', textarea: true },
            { name: 'category', placeholder: 'Категория', select: ['politics', 'economy', 'technology', 'society'] },
          ]} />}

          {tab === 'calendar' && <FormFields action={createCalendarEvent} fields={[
            { name: 'title', placeholder: 'Название события' },
            { name: 'description', placeholder: 'Краткое описание' },
            { name: 'eventDate', placeholder: 'Дата', type: 'date' },
            { name: 'forecast', placeholder: 'Развёрнутый прогноз (опционально)', textarea: true },
          ]} />}

          {tab === 'breaking' && <FormFields action={createBreakingInsight} fields={[
            { name: 'title', placeholder: 'Заголовок сигнала' },
            { name: 'content', placeholder: 'Содержимое', textarea: true },
            { name: 'urgency', placeholder: 'Срочность', select: ['low', 'medium', 'high'] },
          ]} />}

          {tab === 'ai' && <FormFields action={createAiForecast} fields={[
            { name: 'title', placeholder: 'Заголовок' },
            { name: 'prediction', placeholder: 'Прогноз AI', textarea: true },
            { name: 'basis', placeholder: 'На основе каких данных' },
          ]} />}

          {tab === 'accuracy' && <FormFields action={createForecastAccuracy} fields={[
            { name: 'prediction', placeholder: 'Что было предсказано' },
            { name: 'outcome', placeholder: 'Что произошло' },
            { name: 'accurate', placeholder: 'Сбылось?', select: ['true', 'false'] },
            { name: 'predictedAt', placeholder: 'Дата прогноза', type: 'date' },
            { name: 'resolvedAt', placeholder: 'Дата результата (опционально)', type: 'date' },
          ]} />}
        </div>

        {/* Boost likes */}
        <div className="rounded-xl p-4 mb-6 flex items-center gap-3"
          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
          <p className="font-sans text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Накрутка лайков:</p>
          <input value={boostId} onChange={e => setBoostId(e.target.value)} placeholder="ID элемента"
            className="flex-1 rounded-lg px-3 py-1.5 font-sans text-xs outline-none"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          <input value={boostCount} onChange={e => setBoostCount(e.target.value)} placeholder="Кол-во" type="number"
            className="w-16 rounded-lg px-3 py-1.5 font-sans text-xs outline-none"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          <select value={tab} onChange={e => setTab(e.target.value as Tab)}
            className="rounded-lg px-2 py-1.5 font-sans text-xs"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
            <option value="weekly">weekly</option><option value="global">global</option>
            <option value="breaking">breaking</option><option value="ai">ai</option>
          </select>
          <button onClick={() => boostId && handleBoost(boostId, tab)} disabled={isPending}
            className="rounded-lg px-3 py-1.5 font-sans text-xs font-medium"
            style={{ background: 'var(--gold)', color: '#0E1520' }}>
            +Лайки
          </button>
        </div>

        {/* Existing items */}
        <div className="space-y-2">
          {tab === 'weekly' && data.weekly.map((item: any) => (
            <ItemRow key={item.id} item={item} type="weekly" label={`${item.title} (${item.tone})`}
              meta={`♡${item.likes} | ${item.published ? '●' : '○'}`} onDelete={() => handleDelete(item.id, 'weekly')} />
          ))}
          {tab === 'global' && data.globals.map((item: any) => (
            <ItemRow key={item.id} item={item} type="global" label={`[${item.category}] ${item.title}`}
              meta={`♡${item.likes} | ${item.published ? '●' : '○'}`} onDelete={() => handleDelete(item.id, 'global')} />
          ))}
          {tab === 'calendar' && data.calendar.map((item: any) => (
            <ItemRow key={item.id} item={item} type="calendar" label={`${new Date(item.eventDate).toLocaleDateString('ru-RU')} — ${item.title}`}
              meta={item.published ? '●' : '○'} onDelete={() => handleDelete(item.id, 'calendar')} />
          ))}
          {tab === 'breaking' && data.breaking.map((item: any) => (
            <ItemRow key={item.id} item={item} type="breaking" label={`[${item.urgency}] ${item.title}`}
              meta={`♡${item.likes} | ${item.published ? '●' : '○'}`} onDelete={() => handleDelete(item.id, 'breaking')} />
          ))}
          {tab === 'ai' && data.ai.map((item: any) => (
            <ItemRow key={item.id} item={item} type="ai" label={item.title}
              meta={`♡${item.likes} | ${item.published ? '●' : '○'}`} onDelete={() => handleDelete(item.id, 'ai')} />
          ))}
          {tab === 'accuracy' && data.accuracy.map((item: any) => (
            <ItemRow key={item.id} item={item} type="accuracy" label={item.prediction}
              meta={item.accurate ? '✓ сбылось' : '✗ нет'} onDelete={() => handleDelete(item.id, 'accuracy')} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function ItemRow({ item, type, label, meta, onDelete }: { item: any; type: string; label: string; meta: string; onDelete: () => void }) {
  return (
    <div className="rounded-xl px-4 py-3 flex items-center justify-between"
      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-xs truncate" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="font-sans text-[0.6rem]" style={{ color: 'var(--text-muted)' }}>ID: {item.id} | {meta}</p>
      </div>
      <button onClick={onDelete} className="font-sans text-xs ml-3" style={{ color: '#F87171' }}>✕</button>
    </div>
  )
}

function FormFields({ action, fields }: {
  action: (fd: FormData) => Promise<void>
  fields: { name: string; placeholder: string; type?: string; textarea?: boolean; select?: string[] }[]
}) {
  const [pub, setPub] = useState(true)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('published', String(pub))
    await action(fd)
  }

  const inputStyle = { background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {fields.map(f => f.textarea ? (
        <textarea key={f.name} name={f.name} placeholder={f.placeholder} rows={3} required
          className="w-full rounded-xl px-4 py-3 font-sans text-xs outline-none resize-none" style={inputStyle} />
      ) : f.select ? (
        <select key={f.name} name={f.name} className="w-full rounded-xl px-4 py-3 font-sans text-xs outline-none" style={inputStyle}>
          {f.select.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input key={f.name} name={f.name} type={f.type || 'text'} placeholder={f.placeholder} required={f.type !== 'date' || !f.placeholder.includes('опционально')}
          className="w-full rounded-xl px-4 py-3 font-sans text-xs outline-none" style={inputStyle} />
      ))}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <button type="button" onClick={() => setPub(!pub)}
            className="w-8 h-5 rounded-full transition-colors relative"
            style={{ background: pub ? 'var(--gold)' : 'var(--border-default)' }}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
              style={{ transform: pub ? 'translateX(14px)' : 'translateX(2px)' }} />
          </button>
          <span className="font-sans text-xs" style={{ color: 'var(--text-secondary)' }}>{pub ? 'Опубликовано' : 'Черновик'}</span>
        </label>
        <button type="submit" className="rounded-xl px-5 py-2 font-sans text-xs font-medium"
          style={{ background: 'var(--gold)', color: '#0E1520' }}>
          Создать
        </button>
      </div>
    </form>
  )
}
