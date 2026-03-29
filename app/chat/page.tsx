'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/shared/lib/store'

// Legacy chat page — redirects to session-based chat
export default function ChatRedirect() {
  const router = useRouter()
  const { session } = useAppStore()

  useEffect(() => {
    if (session.id) {
      router.replace(`/chat/${session.id}`)
    } else {
      router.replace('/cabinet')
    }
  }, [session.id, router])

  return null
}
