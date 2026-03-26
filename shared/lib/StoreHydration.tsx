'use client'

import { useEffect } from 'react'
import { useAppStore } from './store'
import { useFlowStore } from '@/features/flow/useFlow'

export function StoreHydration() {
  const hydrateApp  = useAppStore((s) => s._hydrate)
  const hydrateFlow = useFlowStore((s) => s._hydrate)

  useEffect(() => {
    hydrateApp()
    hydrateFlow()
  }, [hydrateApp, hydrateFlow])

  return null
}
