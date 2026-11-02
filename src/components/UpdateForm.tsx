import { useState, type FormEvent } from 'react'
import type { NewUpdate } from '../types'

const LAST_NAME_KEY = 'standup-board:last-name'

function rememberedName(): string {
  try {
    return localStorage.getItem(LAST_NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function UpdateForm({
  knownNames,
  onSubmit,
  onCancel,
}: {
  knownNames: string[]
  onSubmit: (u: NewUpdate) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<NewUpdate>({ name: rememberedName(), yesterday: '', today: '', blockers: '' })
  const set = (k: keyof NewUpdate) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })
  const valid = form.name.trim() !== '' && (form.yesterday.trim() !== '' || form.today.trim() !== '')

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    try {
      localStorage.setItem(LAST_NAME_KEY, form.name.trim())
    } catch {
      /* ignore */
    }
    onSubmit(form)
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Today’s update</h2>
      <label>
        Name
        <input value={form.name} onChange={set('name')} list="known-names" placeholder="Your name" required autoFocus />
        <datalist id="known-names">
          {knownNames.map((n) => <option key={n} value={n} />)}
        </datalist>
      </label>
      <div className="form-grid">
        <label>
          Yesterday
          <textarea value={form.yesterday} onChange={set('yesterday')} rows={3} placeholder="What did you get done?" />
        </label>
        <label>
          Today
          <textarea value={form.today} onChange={set('today')} rows={3} placeholder="What are you working on?" />
        </label>
      </div>
      <label>
        Blockers <span className="hint">(optional)</span>
        <textarea value={form.blockers} onChange={set('blockers')} rows={2} placeholder="Anything in your way?" />
      </label>
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary" disabled={!valid}>Post update</button>
      </div>
    </form>
  )
}
