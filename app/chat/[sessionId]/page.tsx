'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { chatReader, chatUser, dur, ease } from '@/shared/animations/variants'

interface Message {
  id: string
  senderType: 'USER' | 'READER'
  content: string
  createdAt: Date | string
}

const SESSION_DURATION_MS = 45 * 60 * 1000 // 45 minutes

export default function LiveChatPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [readerTyping, setReaderTyping] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [readerName, setReaderName] = useState('Консультант')
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [expired, setExpired] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Load messages ───────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?sessionId=${sessionId}`)
      if (!res.ok) return
      const msgs = await res.json()
      setMessages(msgs)
    } catch {}
  }, [sessionId])

  // ── Load session info ───────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) { router.replace('/cabinet'); return }

    async function init() {
      // Fetch session details
      try {
        const res = await fetch(`/api/sessions?sessionId=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.reader?.name) setReaderName(data.reader.name)
        }
      } catch {}

      await loadMessages()
      setInitialized(true)
    }
    init()

    pollRef.current = setInterval(loadMessages, 2500)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [sessionId, router, loadMessages])

  // ── 45-min timer: starts from first READER message ─────────────
  useEffect(() => {
    const firstReaderMsg = messages.find(m => m.senderType === 'READER')
    if (!firstReaderMsg) return

    const startTime = new Date(firstReaderMsg.createdAt).getTime()
    const endTime = startTime + SESSION_DURATION_MS

    function tick() {
      const remaining = endTime - Date.now()
      if (remaining <= 0) {
        setTimeLeft(0)
        setExpired(true)
        if (pollRef.current) clearInterval(pollRef.current)
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setTimeLeft(remaining)
      }
    }

    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [messages])

  // ── Auto-scroll ─────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, readerTyping])

  // ── Auto-resize textarea ────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }, [input])

  // ── Send message ────────────────────────────────────────────────
  async function handleSend() {
    if (!input.trim() || sending || expired) return
    const content = input.trim()
    setInput('')
    setSending(true)

    setMessages(prev => [
      ...prev,
      { id: 'opt-' + Date.now(), senderType: 'USER', content, createdAt: new Date() },
    ])

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, senderType: 'USER', content }),
      })
      setTimeout(loadMessages, 1500)
    } catch {}
    finally { setSending(false) }
  }

  function handleEnd() {
    if (pollRef.current) clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    router.push('/cabinet')
  }

  // ── Format timer ────────────────────────────────────────────────
  function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const initial = readerName.charAt(0)

  return (
    <div className="flex h-[100dvh] flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex-shrink-0 glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3 px-5 py-3.5">
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl font-serif text-sm font-medium"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}>
              {initial}
            </div>
            {!expired && (
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
                style={{ background: '#4ade80', borderColor: 'var(--bg-base)' }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-base font-medium truncate" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {readerName}
            </p>
            <p className="font-sans text-xs mt-0.5" style={{ color: expired ? '#F87171' : 'var(--text-muted)' }}>
              {expired ? 'Сессия завершена' : timeLeft !== null ? `Осталось ${formatTime(timeLeft)}` : 'Сессия активна'}
            </p>
          </div>
          <button onClick={handleEnd}
            className="font-sans text-xs px-3 py-1.5 rounded-full transition-all"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', background: 'var(--bg-raised)' }}>
            {expired ? 'Закрыть' : 'Завершить'}
          </button>
        </div>

        {/* Timer bar */}
        {timeLeft !== null && !expired && (
          <div className="h-0.5 w-full" style={{ background: 'var(--border-subtle)' }}>
            <motion.div className="h-full" style={{ background: timeLeft < 300000 ? '#F87171' : 'var(--gold)' }}
              animate={{ width: `${Math.max(0, (timeLeft / SESSION_DURATION_MS) * 100)}%` }}
              transition={{ duration: 1 }} />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {!initialized && (
          <div className="flex justify-center py-12">
            <Dots />
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={msg.id} variants={msg.senderType === 'READER' ? chatReader : chatUser}
              initial="hidden" animate="visible" layout="position"
              className={msg.senderType === 'USER' ? 'flex justify-end' : 'flex justify-start'}>
              {msg.senderType === 'READER' ? (
                <div className="flex items-end gap-3 max-w-[84%]">
                  <div className="flex-shrink-0 w-8">
                    {(i === 0 || messages[i - 1]?.senderType !== 'READER') && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl font-serif text-xs"
                        style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}>{initial}</div>
                    )}
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-5 py-4"
                    style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                    <p className="font-sans text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-[78%] rounded-2xl rounded-br-sm px-5 py-3.5"
                  style={{ background: 'var(--text-primary)', color: 'var(--bg-raised)' }}>
                  <p className="font-sans text-sm" style={{ lineHeight: 1.7 }}>{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Expired banner */}
        {expired && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl px-5 py-4 text-center"
            style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
            <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
              45-минутная сессия завершена. Вы можете просмотреть историю переписки в кабинете.
            </p>
            <button onClick={handleEnd}
              className="mt-3 rounded-xl px-6 py-2 font-sans text-xs font-medium"
              style={{ background: 'var(--gold)', color: '#0E1520' }}>
              Вернуться в кабинет
            </button>
          </motion.div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input — disabled when expired */}
      {!expired && (
        <div className="flex-shrink-0 glass safe-bottom" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-end gap-3 px-5 py-3.5">
            <textarea ref={textareaRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder={`Напишите ${readerName.split(' ')[0]}…`}
              rows={1}
              style={{ minHeight: '44px', maxHeight: '128px', background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              className="flex-1 resize-none overflow-hidden rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none transition-all"
              onFocus={e => { e.target.style.borderColor = 'var(--gold-light)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-subtle)' }}
            />
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-opacity disabled:opacity-30"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-raised)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1.5 7L12.5 1.5L8 12.5L6.5 8L1.5 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}

function Dots() {
  return (
    <div className="flex gap-1.5 items-center h-4">
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--border-default)' }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }} />
      ))}
    </div>
  )
}
