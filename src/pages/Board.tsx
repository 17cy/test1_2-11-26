import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { hasOpenBlocker, useStore } from '../store'
import type { Update } from '../types'
import Avatar from '../components/Avatar'
import EmptyState from '../components/EmptyState'
import UpdateCard from '../components/UpdateCard'
import UpdateForm from '../components/UpdateForm'

const byNewest = (a: Update, b: Update) => b.createdAt.localeCompare(a.createdAt)

export default function Board() {
  const { updates, add, toggleResolved, remove } = useStore()
  const [params, setParams] = useSearchParams()
  const [showForm, setShowForm] = useState(false)

  // Filters live in the URL so a filtered board can be shared as a link.
  const person = params.get('person') ?? ''
  const query = params.get('q') ?? ''
  const blockedOnly = params.get('blocked') === '1'

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const names = useMemo(() => [...new Set(updates.map((u) => u.name))].sort(), [updates])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const visible = updates
      .filter((u) => !person || u.name === person)
      .filter((u) => !blockedOnly || hasOpenBlocker(u))
      .filter((u) => !q || [u.name, u.yesterday, u.today, u.blockers].some((s) => s.toLowerCase().includes(q)))
      .sort(byNewest)

    const map = new Map<string, Update[]>()
    for (const u of visible) map.set(u.name, [...(map.get(u.name) ?? []), u])
    // Map keeps insertion order, and the list is sorted newest first,
    // so whoever posted most recently comes first.
    return [...map.entries()]
  }, [updates, person, query, blockedOnly])

  const openCount = updates.filter(hasOpenBlocker).length
  const filtering = person !== '' || query !== '' || blockedOnly

  function remove_(u: Update) {
    if (window.confirm(`Delete ${u.name}’s update from ${new Date(u.createdAt).toLocaleDateString()}?`)) remove(u.id)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Standup</h1>
          <p className="muted">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}
            {openCount === 0 ? 'no open blockers 🎉' : `${openCount} open blocker${openCount === 1 ? '' : 's'}`}
          </p>
        </div>
        {!showForm && (
          <button className="btn primary" onClick={() => setShowForm(true)}>+ Add update</button>
        )}
      </div>

      {showForm && (
        <UpdateForm
          knownNames={names}
          onCancel={() => setShowForm(false)}
          onSubmit={(u) => {
            add(u)
            setShowForm(false)
          }}
        />
      )}

      {updates.length > 0 && (
        <div className="filters">
          <input
            type="search"
            placeholder="Search updates…"
            value={query}
            onChange={(e) => setFilter('q', e.target.value)}
            aria-label="Search updates"
          />
          <select value={person} onChange={(e) => setFilter('person', e.target.value)} aria-label="Filter by person">
            <option value="">Everyone</option>
            {names.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <label className="check">
            <input type="checkbox" checked={blockedOnly} onChange={(e) => setFilter('blocked', e.target.checked ? '1' : '')} />
            Open blockers only
          </label>
        </div>
      )}

      {groups.length === 0 ? (
        updates.length === 0 ? (
          <EmptyState title="No updates yet">
            <p className="muted">Be the first to post today’s standup.</p>
            {!showForm && <button className="btn primary" onClick={() => setShowForm(true)}>+ Add update</button>}
          </EmptyState>
        ) : (
          <EmptyState title="Nothing matches those filters">
            {filtering && <button className="btn ghost" onClick={() => setParams({}, { replace: true })}>Clear filters</button>}
          </EmptyState>
        )
      ) : (
        <div className="groups">
          {groups.map(([name, list]) => {
            const open = list.filter(hasOpenBlocker).length
            return (
              <section key={name} className="group">
                <header className="group-head">
                  <Avatar name={name} />
                  <h3>{name}</h3>
                  <span className="count">{list.length}</span>
                  {open > 0 && <span className="pill warn">{open} blocked</span>}
                </header>
                <div className="cards">
                  {list.map((u) => (
                    <UpdateCard key={u.id} update={u} onToggleResolved={() => toggleResolved(u.id)} onDelete={() => remove_(u)} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
