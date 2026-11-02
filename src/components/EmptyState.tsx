import type { ReactNode } from 'react'

export default function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <img src="/empty-state.png" alt="" width={320} height={220} />
      <h2>{title}</h2>
      {children}
    </div>
  )
}
