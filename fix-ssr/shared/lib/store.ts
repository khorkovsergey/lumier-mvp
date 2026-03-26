import { create } from 'zustand'

interface UserState {
  id: string | null
  name: string | null
  dateOfBirth: string | null
}

interface QuestionState {
  id: string | null
  text: string | null
  category: string | null
}

interface ReaderContext {
  id: string | null
  name: string | null
  specialization: string | null
  price: number | null
  tier: 'FOUNDATION' | 'SENIOR' | 'MASTER' | null
}

interface SessionContext {
  id: string | null
  orderId: string | null
  type: 'LIVE' | 'ASYNC' | null
}

interface AppStore {
  user: UserState
  question: QuestionState
  reader: ReaderContext
  session: SessionContext
  _hydrated: boolean

  setUser: (user: UserState) => void
  setQuestion: (q: Partial<QuestionState>) => void
  setReader: (r: Partial<ReaderContext>) => void
  setSession: (s: Partial<SessionContext>) => void
  clearSession: () => void
  reset: () => void
  _hydrate: () => void
}

const emptyUser: UserState = { id: null, name: null, dateOfBirth: null }
const emptyQuestion: QuestionState = { id: null, text: null, category: null }
const emptyReader: ReaderContext = { id: null, name: null, specialization: null, price: null, tier: null }
const emptySession: SessionContext = { id: null, orderId: null, type: null }

const STORAGE_KEY = 'lumina-app-state'

// Read from localStorage manually — only called client-side
function readStorage(): Partial<AppStore> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeStorage(state: Partial<AppStore>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      question: state.question,
      reader: state.reader,
      session: state.session,
    }))
  } catch {}
}

export const useAppStore = create<AppStore>()((set, get) => ({
  user:      emptyUser,
  question:  emptyQuestion,
  reader:    emptyReader,
  session:   emptySession,
  _hydrated: false,

  setUser: (user) => {
    set({ user })
    writeStorage({ ...get(), user })
  },
  setQuestion: (q) => {
    const question = { ...get().question, ...q }
    set({ question })
    writeStorage({ ...get(), question })
  },
  setReader: (r) => {
    const reader = { ...get().reader, ...r }
    set({ reader })
    writeStorage({ ...get(), reader })
  },
  setSession: (s) => {
    const session = { ...get().session, ...s }
    set({ session })
    writeStorage({ ...get(), session })
  },
  clearSession: () => {
    set({ question: emptyQuestion, reader: emptyReader, session: emptySession })
    writeStorage({ ...get(), question: emptyQuestion, reader: emptyReader, session: emptySession })
  },
  reset: () => {
    set({ user: emptyUser, question: emptyQuestion, reader: emptyReader, session: emptySession })
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  },

  // Call once on client mount to load persisted state
  _hydrate: () => {
    if (get()._hydrated) return
    const saved = readStorage()
    set({
      user:      saved.user      ?? emptyUser,
      question:  saved.question  ?? emptyQuestion,
      reader:    saved.reader    ?? emptyReader,
      session:   saved.session   ?? emptySession,
      _hydrated: true,
    })
  },
}))
