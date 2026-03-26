'use client'

import { useEffect } from 'react'
import { useAppStore } from './store'

export function StoreHydration() {
  const hydrate = useAppStore((s) => s._hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  return null
}
