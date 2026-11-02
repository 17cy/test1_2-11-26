import type { Update } from '../types'
import { hasOpenBlocker } from '../store'
import { timeAgo } from '../people'

export default function UpdateCard({
  update,
  onToggleResolved,
  onDelete,
}: {
  update: Update
  onToggleResolved: () => void
  onDelete: () => void
}) {
  const open = hasOpenBlocker(update)
  const hasBlocker = update.blockers.trim() !== ''
  const date = new Date(update.createdAt)

  return (
    <article className={`card update${open ? ' blocked' : ''}`}>
      <div className="update-meta">
        <time dateTime={update.createdAt} title={date.toLocaleString()}>{timeAgo(update.createdAt)}</time>
        <button className="icon-btn" onClick={onDelete} aria-label="Delete update" title="Delete update">×</button>
      </div>
      {update.yesterday && (
        <section>
          <h4>Yesterday</h4>
          <p>{update.yesterday}</p>
        </section>
      )}
      {update.today && (
        <section>
          <h4>Today</h4>
          <p>{update.today}</p>
        </section>
      )}
      {hasBlocker && (
        <section className={`blocker${open ? '' : ' resolved'}`}>
          <h4>{open ? '⚠ Blocker' : '✓ Blocker resolved'}</h4>
          <p>{update.blockers}</p>
          <button className={`btn small ${open ? 'warn' : 'ghost'}`} onClick={onToggleResolved}>
            {open ? 'Mark resolved' : 'Reopen'}
          </button>
        </section>
      )}
    </article>
  )
}
