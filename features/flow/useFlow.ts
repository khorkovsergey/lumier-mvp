'use client'

import { create } from 'zustand'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export const FLOW_STEPS = [
  'onboarding',
  'question',
  'readers',
  'checkout',
  'session-format',
  'live',
  'async-submitted',
  'async-status',
  'result',
] as const

export type FlowStep = (typeof FLOW_STEPS)[number]

const STEP_ROUTES: Record<FlowStep, string> = {
  'onboarding':       '/onboarding',
  'question':         '/question',
  'readers':          '/readers',
  'checkout':         '/checkout',
  'session-format':   '/session-format',
  'live':             '/chat',
  'async-submitted':  '/async/submitted',
  'async-status':     '/async/status',
  'result':           '/result',
}

const STEP_GUARDS: Partial<Record<FlowStep, FlowStep[]>> = {
  'question':        ['onboarding'],
  'readers':         ['onboarding', 'question'],
  'checkout':        ['onboarding', 'question', 'readers'],
  'session-format':  ['onboarding', 'question', 'readers', 'checkout'],
  'live':            ['onboarding', 'question', 'readers', 'checkout', 'session-format'],
  'async-submitted': ['onboarding', 'question', 'readers', 'checkout', 'session-format'],
  'async-status':    ['onboarding', 'question', 'readers', 'checkout', 'session-format'],
  'result':          ['onboarding', 'question', 'readers', 'checkout', 'session-format'],
}

const FLOW_KEY = 'lumina-flow'

function readFlow(): FlowStep[] {
  try {
    const raw = localStorage.getItem(FLOW_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeFlow(steps: FlowStep[]) {
  try {
    localStorage.setItem(FLOW_KEY, JSON.stringify(steps))
  } catch {}
}

interface FlowStore {
  completedSteps: FlowStep[]
  currentStep: FlowStep | null
  _hydrated: boolean

  markComplete: (step: FlowStep) => void
  setCurrentStep: (step: FlowStep) => void
  hasCompleted: (step: FlowStep) => boolean
  canAccessStep: (step: FlowStep) => boolean
  reset: () => void
  _hydrate: () => void
}

export const useFlowStore = create<FlowStore>()((set, get) => ({
  completedSteps: [],
  currentStep: null,
  _hydrated: false,

  markComplete: (step) => {
    const next = get().completedSteps.includes(step)
      ? get().completedSteps
      : [...get().completedSteps, step]
    set({ completedSteps: next })
    writeFlow(next)
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  hasCompleted: (step) => get().completedSteps.includes(step),

  canAccessStep: (step) => {
    const required = STEP_GUARDS[step]
    if (!required) return true
    return required.every((s) => get().completedSteps.includes(s))
  },

  reset: () => {
    set({ completedSteps: [], currentStep: null })
    try { localStorage.removeItem(FLOW_KEY) } catch {}
  },

  _hydrate: () => {
    if (get()._hydrated) return
    const saved = readFlow()
    set({ completedSteps: saved, _hydrated: true })
  },
}))

export function useFlow() {
  const router = useRouter()
  const { markComplete, setCurrentStep, hasCompleted, canAccessStep, reset } = useFlowStore()

  const advance = useCallback(
    (completedStep: FlowStep, nextStep: FlowStep) => {
      markComplete(completedStep)
      setCurrentStep(nextStep)
      router.push(STEP_ROUTES[nextStep])
    },
    [markComplete, setCurrentStep, router]
  )

  const goTo = useCallback(
    (step: FlowStep) => {
      if (!canAccessStep(step)) {
        router.replace(STEP_ROUTES['onboarding'])
        return
      }
      setCurrentStep(step)
      router.push(STEP_ROUTES[step])
    },
    [canAccessStep, setCurrentStep, router]
  )

  const guardStep = useCallback(
    (step: FlowStep): boolean => {
      if (!canAccessStep(step)) {
        router.replace(STEP_ROUTES['onboarding'])
        return false
      }
      return true
    },
    [canAccessStep, router]
  )

  return { advance, goTo, guardStep, hasCompleted, canAccessStep, reset, STEP_ROUTES }
}
