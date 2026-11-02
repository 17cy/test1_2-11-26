import { useRef, useState, type ChangeEvent } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { exportJson, parseUpdates, useStore } from './store'
import Board from './pages/Board'
import Stats from './pages/Stats'

export default function App() {
  const { updates, replaceAll } = useStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<string | null>(null)

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3000)
  }

  async function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    try {
      const list = parseUpdates(JSON.parse(await file.text()))
      if (!list) return flash('That file doesn’t look like a standup export.')
      if (!window.confirm(`Replace the current ${updates.length} updates with ${list.length} from "${file.name}"?`)) return
      replaceAll(list)
      flash(`Imported ${list.length} updates.`)
    } catch {
      flash('Couldn’t read that file — is it valid JSON?')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Team Standup Board home">
          <img src="/logo.svg" alt="" width={32} height={32} />
          <span>Standup Board</span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>Board</NavLink>
          <NavLink to="/stats">Stats</NavLink>
        </nav>
        <div className="io">
          <button className="btn ghost small" onClick={() => exportJson(updates)}>Export JSON</button>
          <button className="btn ghost small" onClick={() => fileInput.current?.click()}>Import JSON</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={onImport} />
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Board />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
