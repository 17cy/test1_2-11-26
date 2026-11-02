import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { hasOpenBlocker, startOfWeek, useStore } from '../store'
import { colorFor, timeAgo } from '../people'
import Avatar from '../components/Avatar'
import BarChart from '../components/BarChart'
import EmptyState from '../components/EmptyState'

export default function Stats() {
  const { updates, toggleResolved } = useStore()

  const { perPerson, weekCount, openBlockers } = useMemo(() => {
    const weekStart = startOfWeek().getTime()
    const thisWeek = updates.filter((u) => Date.parse(u.createdAt) >= weekStart)
    const counts = new Map<string, number>()
    // Include everyone who has ever posted, so a quiet week shows up as a zero.
    for (const u of updates) counts.set(u.name, 0)
    for (const u of thisWeek) counts.set(u.name, (counts.get(u.name) ?? 0) + 1)
    return {
      perPerson: [...counts.entries()]
        .map(([label, value]) => ({ label, value, color: colorFor(label) }))
        .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
      weekCount: thisWeek.length,
      openBlockers: updates.filter(hasOpenBlocker).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }
  }, [updates])

  if (updates.length === 0) {
    return (
      <EmptyState title="No stats yet">
        <p className="muted">Stats appear once the team starts posting.</p>
        <Link className="btn primary" to="/">Go to the board</Link>
      </EmptyState>
    )
  }

  const weekLabel = startOfWeek().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Stats</h1>
          <p className="muted">Week of {weekLabel}</p>
        </div>
      </div>

      <div className="tiles">
        <div className="tile">
          <span className="tile-value">{weekCount}</span>
          <span className="tile-label">updates this week</span>
        </div>
        <div className="tile">
          <span className="tile-value">{perPerson.filter((p) => p.value > 0).length}</span>
          <span className="tile-label">people posted</span>
        </div>
        <div className={`tile${openBlockers.length ? ' warn' : ''}`}>
          <span className="tile-value">{openBlockers.length}</span>
          <span className="tile-label">open blockers</span>
        </div>
      </div>

      <section className="card">
        <h2>Updates per person this week</h2>
        <BarChart data={perPerson} />
      </section>

      <section className="card">
        <h2>Open blockers</h2>
        {openBlockers.length === 0 ? (
          <p className="muted">Nothing blocked right now. 🎉</p>
        ) : (
          <ul className="blocker-list">
            {openBlockers.map((u) => (
              <li key={u.id}>
                <Avatar name={u.name} size={28} />
                <div>
                  <p>{u.blockers}</p>
                  <span className="muted small">{u.name} · {timeAgo(u.createdAt)}</span>
                </div>
                <button className="btn small warn" onClick={() => toggleResolved(u.id)}>Resolve</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
