'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { sendMessage, getMessages, sendReaderGreeting } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { chatReader, chatUser, dur, ease } from '@/shared/animations/variants'

interface Message {
  id: string
  senderType: 'USER' | 'READER'
  content: string
  createdAt: Date | string
}

const READER_DELAY_MS = 2200

export default function ChatPage() {
  const router = useRouter()
  const { session, reader } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [readerTyping, setReaderTyping] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!session.id) router.replace('/onboarding')
  }, [session.id, router])

  useEffect(() => {
    if (!session.id) return
    const init = async () => {
      if (reader.name) await sendReaderGreeting(session.id!, reader.name)
      await loadMessages()
      setInitialized(true)
    }
    init()
    pollRef.current = setInterval(loadMessages, 2800)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [session.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, readerTyping])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }, [input])

  async function loadMessages() {
    if (!session.id) return
    try {
      const msgs = await getMessages(session.id)
      setMessages(msgs as Message[])
    } catch {}
  }

  async function handleSend() {
    if (!input.trim() || sending || !session.id) return
    const content = input.trim()
    setInput('')
    setSending(true)

    setMessages((prev) => [
      ...prev,
      { id: 'opt-' + Date.now(), senderType: 'USER', content, createdAt: new Date() },
    ])

    setTimeout(() => setReaderTyping(true), 400)

    try {
      await sendMessage({ sessionId: session.id, senderType: 'USER', content })
      setTimeout(async () => {
        await loadMessages()
        setReaderTyping(false)
      }, READER_DELAY_MS)
    } catch {
      setReaderTyping(false)
    } finally {
      setSending(false)
    }
  }

  const initial = reader.name?.charAt(0) ?? 'Ч'
  const firstName = reader.name?.split(' ')[0] ?? 'Консультант'

  return (
    <div className="flex h-[100dvh] flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Шапка */}
      <div className="flex-shrink-0 glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3 px-5 py-3.5">
          <div className="relative flex-shrink-0">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl font-serif text-sm font-medium"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}
            >
              {initial}
            </div>
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
              style={{ background: '#4ade80', borderColor: 'var(--bg-base)' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-base font-medium truncate" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {reader.name ?? 'Ваш Консультант'}
            </p>
            <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {reader.specialization ?? 'Сессия активна'}
            </p>
          </div>
          <button
            onClick={() => { if (pollRef.current) clearInterval(pollRef.current); router.push('/cabinet') }}
            className="font-sans text-xs px-3 py-1.5 rounded-full transition-all"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', background: 'var(--bg-raised)' }}
          >
            Завершить
          </button>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {!initialized && (
          <div className="flex justify-center py-12">
            <ConsultationDots />
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              variants={msg.senderType === 'READER' ? chatReader : chatUser}
              initial="hidden"
              animate="visible"
              layout="position"
              className={msg.senderType === 'USER' ? 'flex justify-end' : 'flex justify-start'}
            >
              {msg.senderType === 'READER' ? (
                <ReaderMessage
                  content={msg.content}
                  initial={initial}
                  isFirst={i === 0 || messages[i - 1]?.senderType !== 'READER'}
                />
              ) : (
                <UserMessage content={msg.content} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {readerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: dur.normal, ease: ease.outSoft }}
              className="flex items-end gap-3"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 font-serif text-xs"
                style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}
              >
                {initial}
              </div>
              <div
                className="rounded-2xl rounded-bl-sm px-5 py-3.5"
                style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <ConsultationDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Поле ввода */}
      <div className="flex-shrink-0 glass safe-bottom" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-end gap-3 px-5 py-3.5">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={`Напишите ${firstName}…`}
            rows={1}
            style={{
              minHeight: '44px',
              maxHeight: '128px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            className="flex-1 resize-none overflow-hidden rounded-2xl px-4 py-3 font-sans text-sm placeholder:text-stone-300 focus:outline-none transition-all"
            onFocus={(e) => { e.target.style.borderColor = 'var(--gold-light)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-subtle)' }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.04 }}
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-opacity disabled:opacity-30"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-raised)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1.5 7L12.5 1.5L8 12.5L6.5 8L1.5 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function ReaderMessage({ content, initial, isFirst }: { content: string; initial: string; isFirst: boolean }) {
  return (
    <div className="flex items-end gap-3 max-w-[84%]">
      <div className="flex-shrink-0 w-8">
        {isFirst && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl font-serif text-xs"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}
          >
            {initial}
          </div>
        )}
      </div>
      <div
        className="rounded-2xl rounded-bl-sm px-5 py-4"
        style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        <p className="font-sans text-sm" style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>
          {content}
        </p>
      </div>
    </div>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div
      className="max-w-[78%] rounded-2xl rounded-br-sm px-5 py-3.5"
      style={{ background: 'var(--text-primary)', color: 'var(--bg-raised)' }}
    >
      <p className="font-sans text-sm" style={{ lineHeight: 1.7 }}>
        {content}
      </p>
    </div>
  )
}

function ConsultationDots() {
  return (
    <div className="flex gap-1.5 items-center h-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--border-default)' }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
