import type { WeeklyWeight } from '../types'
import { shortLabel } from '../lib/dates'
import styles from './WeightChart.module.css'

export function WeightChart({ weights }: { weights: WeeklyWeight[] }) {
  const rows = [...weights]
    .filter((w) => w.weight_kg != null)
    .sort((a, b) => a.week_start.localeCompare(b.week_start))

  if (rows.length === 0) {
    return <p className={styles.empty}>Ainda sem registros de peso. O peso é semanal.</p>
  }

  const values = rows.map((r) => r.weight_kg as number)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const W = 340
  const H = 140
  const padX = 12
  const padTop = 14
  const padBottom = 22
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom
  const step = rows.length > 1 ? innerW / (rows.length - 1) : 0

  const pts = rows.map((r, i) => {
    const x = padX + (rows.length > 1 ? i * step : innerW / 2)
    const y = padTop + innerH - ((r.weight_kg as number) - min) / range * innerH
    return { x, y, r }
  })

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="Peso semanal">
        <text x={padX} y={padTop} className={styles.tick}>{max.toFixed(1)} kg</text>
        <text x={padX} y={H - 6} className={styles.tick}>{min.toFixed(1)} kg</text>
        {rows.length > 1 && <path d={path} className={styles.line} />}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} className={styles.dot} />
          </g>
        ))}
      </svg>
      <div className={styles.axis}>
        <span>{shortLabel(rows[0].week_start)}</span>
        {rows.length > 1 && <span>{shortLabel(rows[rows.length - 1].week_start)}</span>}
      </div>
    </div>
  )
}
