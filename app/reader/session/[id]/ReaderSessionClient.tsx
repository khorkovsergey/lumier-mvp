'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { readerSendMessage, saveReadingDraft, publishReading } from '@/server/actions/reader'
import { getMessages } from '@/server/actions'

type Tab = 'chat' | 'reading'

interface Message {
  id: string
  senderType: 'USER' | 'READER'
  content: string
  type: 'TEXT' | 'READING_DRAFT' | 'READING_PUBLISHED'
  createdAt: Date | string
}

interface Session {
  id: string
  type: 'LIVE' | 'ASYNC'
  status: string
  user: { id: string; name: string; email: string | null; dateOfBirth: Date | null }
  reader: { id: string; name: string; specialization: string }
  asyncReading: { id: string; status: string; resultText: string | null; draftText: string | null } | null
  messages: Message[]
}

export function ReaderSessionClient({ session }: { session: Session }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('chat')
  const [messages, setMessages] = useState<Message[]>(session.messages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState(session.asyncReading?.draftText ?? '')
  const [savingDraft, setSavingDraft] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(session.asyncReading?.status === 'COMPLETED')
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const msgs = await getMessages(session.id)
      setMessages(msgs as Message[])
    }, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [session.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    try {
      await readerSendMessage(session.id, content)
      const msgs = await getMessages(session.id)
      setMessages(msgs as Message[])
    } finally {
      setSending(false)
    }
  }

  async function handleSaveDraft() {
    setSavingDraft(true)
    try {
      await saveReadingDraft(session.id, draft)
    } finally {
      setSavingDraft(false)
    }
  }

  async function handlePublish() {
    if (!draft.trim()) return
    setPublishing(true)
    try {
      await publishReading(session.id, draft)
      setPublished(true)
      // Also reload messages to show published reading in chat
      const msgs = await getMessages(session.id)
      setMessages(msgs as Message[])
    } finally {
      setPublishing(false)
    }
  }

  const clientAge = session.user.dateOfBirth
    ? Math.floor((Date.now() - new Date(session.user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="flex h-[100dvh] flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* Шапка */}
      <div className="flex-shrink-0 glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button onClick={() => router.push('/reader/dashboard')}
            className="font-sans text-xs transition-opacity hover:opacity-60 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}>
            ← Назад
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {session.user.name}
            </p>
            <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              {session.type === 'ASYNC' ? 'Письменный расклад' : 'Живая сессия'}
              {clientAge && ` · ${clientAge} лет`}
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>

        {/* Вкладки */}
        <div className="flex border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          {(['chat', 'reading'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 font-sans text-xs font-medium transition-all"
              style={{
                color: tab === t ? 'var(--gold)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
              }}>
              {t === 'chat' ? `💬 Чат (${messages.length})` : '✦ Расклад'}
            </button>
          ))}
        </div>
      </div>

      {/* Контент вкладки */}
      <AnimatePresence mode="wait">
        {tab === 'chat' ? (
          <motion.div key="chat"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}
            className="flex flex-1 flex-col overflow-hidden">

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {messages.map(msg => (
                <div key={msg.id}
                  className={`flex ${msg.senderType === 'READER' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'READING_PUBLISHED' ? (
                    <PublishedReadingBubble content={msg.content} />
                  ) : (
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.senderType === 'READER' ? 'rounded-br-sm' : 'rounded-bl-sm'
                    }`}
                      style={msg.senderType === 'READER'
                        ? { background: 'var(--text-primary)', color: 'var(--bg-raised)' }
                        : { background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }
                      }>
                      {msg.senderType === 'USER' && (
                        <p className="font-sans text-[0.65rem] mb-1" style={{ color: 'var(--text-muted)' }}>
                          {session.user.name.split(' ')[0]}
                        </p>
                      )}
                      <p className="font-sans text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Поле ввода */}
            {session.status !== 'COMPLETED' && (
              <div className="flex-shrink-0 glass safe-bottom" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div className="flex items-end gap-3 px-5 py-3.5">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Написать клиенту…"
                    rows={1}
                    className="flex-1 resize-none overflow-hidden rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none"
                    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', minHeight: 44, maxHeight: 120 }}
                  />
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl disabled:opacity-30"
                    style={{ background: 'var(--gold)', color: 'white' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1.5 7L12.5 1.5L8 12.5L6.5 8L1.5 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="reading"
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
            className="flex flex-1 flex-col overflow-hidden">

            {published ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center gap-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <span className="text-2xl" style={{ color: '#16a34a' }}>✓</span>
                </div>
                <p className="font-serif text-xl font-light" style={{ color: 'var(--text-primary)' }}>
                  Расклад опубликован
                </p>
                <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
                  Клиент получил уведомление и может просмотреть расклад
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Инфо о клиенте */}
                <div className="flex-shrink-0 px-5 pt-4 pb-3"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <p className="label-overline mb-1" style={{ color: 'var(--text-muted)' }}>Контекст клиента</p>
                  <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {session.user.name}
                    {clientAge && `, ${clientAge} лет`}
                  </p>
                </div>

                {/* Редактор */}
                <div className="flex-1 flex flex-col px-5 pt-4 pb-3 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Текст расклада</p>
                    <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                      Поддерживается **markdown**
                    </p>
                  </div>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder={`**Ваш расклад: Название**\n\n*Вступление*\n\n---\n\n**Позиция 1 — Где вы стоите: Название карты**\n\nОписание...\n\n---\n\n**В итоге**\n\nЗаключение...`}
                    className="flex-1 resize-none rounded-xl px-4 py-3 font-sans text-sm focus:outline-none"
                    style={{
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.7,
                      minHeight: 0,
                    }}
                  />
                  <p className="mt-1.5 font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                    {draft.length} символов
                  </p>
                </div>

                {/* Кнопки */}
                <div className="flex-shrink-0 safe-bottom px-5 pb-5 pt-3 flex gap-3"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={handleSaveDraft} disabled={savingDraft || !draft.trim()}
                    className="flex-1 rounded-xl py-3 font-sans text-sm font-medium transition-all disabled:opacity-40"
                    style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)', background: 'var(--bg-float)' }}>
                    {savingDraft ? 'Сохраняем…' : '💾 Черновик'}
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={handlePublish} disabled={publishing || !draft.trim()}
                    className="flex-2 rounded-xl px-6 py-3 font-sans text-sm font-medium transition-all disabled:opacity-40"
                    style={{ background: 'var(--gold)', color: 'white', flex: 2 }}>
                    {publishing ? 'Публикуем…' : '✦ Опубликовать клиенту'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    PENDING:   { label: 'Новый',    color: 'var(--gold)', bg: 'rgba(196,150,74,0.1)' },
    ACTIVE:    { label: 'Активен',  color: '#2563eb',     bg: '#eff6ff' },
    COMPLETED: { label: 'Завершён', color: '#16a34a',     bg: '#f0fdf4' },
    CANCELLED: { label: 'Отменён',  color: '#ef4444',     bg: '#fef2f2' },
  }
  const s = map[status] ?? map.PENDING
  return (
    <span className="flex-shrink-0 rounded-full px-2.5 py-1 font-sans text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

function PublishedReadingBubble({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const preview = content.slice(0, 120)

  return (
    <div className="w-full max-w-[90%] mx-auto rounded-2xl p-4"
      style={{ background: 'rgba(196,150,74,0.06)', border: '1px solid rgba(196,150,74,0.2)' }}>
      <p className="label-overline mb-2" style={{ color: 'var(--gold)' }}>✦ Опубликованный расклад</p>
      <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {expanded ? content : preview + (content.length > 120 ? '…' : '')}
      </p>
      {content.length > 120 && (
        <button onClick={() => setExpanded(!expanded)}
          className="mt-2 font-sans text-xs" style={{ color: 'var(--gold)' }}>
          {expanded ? 'Свернуть' : 'Читать полностью'}
        </button>
      )}
    </div>
  )
}
