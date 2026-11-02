import { useEffect, useRef, useState } from 'react'

interface Bar {
  label: string
  value: number
  color: string
}

/** Horizontal bar chart in plain SVG. Drawn at the container's real width so text stays readable on phones. */
export default function BarChart({ data }: { data: Bar[] }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(520)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const rowH = 36
  const labelW = width < 400 ? 96 : 120
  const chartW = width - labelW - 32 // leave room for the value label
  const height = data.length * rowH
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div ref={wrap}>
      <svg
        className="bar-chart"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={data.map((d) => `${d.label}: ${d.value}`).join(', ')}
      >
        {data.map((d, i) => {
          const w = (d.value / max) * chartW
          return (
            <g key={d.label} transform={`translate(0 ${i * rowH})`}>
              <text x={labelW - 10} y={rowH / 2} textAnchor="end" dominantBaseline="central" className="bar-label">
                {d.label.length > 13 ? d.label.slice(0, 12) + '…' : d.label}
              </text>
              <rect x={labelW} y={8} width={chartW} height={rowH - 16} rx={6} className="bar-track" />
              {d.value > 0 && <rect x={labelW} y={8} width={Math.max(w, 8)} height={rowH - 16} rx={6} fill={d.color} />}
              <text x={labelW + w + 8} y={rowH / 2} dominantBaseline="central" className="bar-value">
                {d.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
