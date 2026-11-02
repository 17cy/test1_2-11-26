import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { NewUpdate, Update } from './types'
import { makeSeed } from './seed'

const STORAGE_KEY = 'standup-board:updates'

function load(): Update[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return makeSeed() // first visit
    const parsed = parseUpdates(JSON.parse(raw))
    return parsed ?? makeSeed()
  } catch {
    return makeSeed()
  }
}

/** Validates unknown JSON into a list of updates; returns null if the shape is wrong. */
export function parseUpdates(data: unknown): Update[] | null {
  const list = Array.isArray(data) ? data : (data as { updates?: unknown })?.updates
  if (!Array.isArray(list)) return null
  const out: Update[] = []
  // Entries without a timestamp keep their file order (first = newest).
  const now = Date.now()
  for (const [i, item] of list.entries()) {
    if (!item || typeof item !== 'object') return null
    const u = item as Record<string, unknown>
    if (typeof u.name !== 'string' || !u.name.trim()) return null
    const createdAt = typeof u.createdAt === 'string' && !isNaN(Date.parse(u.createdAt))
      ? u.createdAt
      : new Date(now - i * 1000).toISOString()
    out.push({
      id: typeof u.id === 'string' && u.id ? u.id : newId(),
      name: u.name.trim(),
      yesterday: typeof u.yesterday === 'string' ? u.yesterday : '',
      today: typeof u.today === 'string' ? u.today : '',
      blockers: typeof u.blockers === 'string' ? u.blockers : '',
      blockerResolved: u.blockerResolved === true,
      createdAt,
    })
  }
  return out
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `u-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

interface Store {
  updates: Update[]
  add: (u: NewUpdate) => void
  toggleResolved: (id: string) => void
  remove: (id: string) => void
  replaceAll: (list: Update[]) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [updates, setUpdates] = useState<Update[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updates))
    } catch {
      // Storage full or blocked (private mode) — the board still works for this session.
    }
  }, [updates])

  const store: Store = {
    updates,
    add: (u) =>
      setUpdates((prev) => [
        {
          ...u,
          name: u.name.trim(),
          id: newId(),
          blockerResolved: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]),
    toggleResolved: (id) =>
      setUpdates((prev) => prev.map((u) => (u.id === id ? { ...u, blockerResolved: !u.blockerResolved } : u))),
    remove: (id) => setUpdates((prev) => prev.filter((u) => u.id !== id)),
    replaceAll: setUpdates,
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export function hasOpenBlocker(u: Update): boolean {
  return u.blockers.trim() !== '' && !u.blockerResolved
}

/** Monday 00:00 local time of the current week. */
export function startOfWeek(now = new Date()): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - day)
  return d
}

export function exportJson(updates: Update[]) {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), updates }, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `standup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
