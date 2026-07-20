import type { Entry } from '../types'
import { focusFor } from '../lib/stats'
import { lastNDates, weekdayLabel } from '../lib/dates'
import styles from './ECGLine.module.css'

/**
 * Linha tipo monitor/ECG dos últimos 14 dias. A altura de cada ponto reflete
 * quantos dos 3 focos (sono, estudo, alimentação) foram cumpridos naquele dia.
 */
export function ECGLine({ entries }: { entries: Entry[] }) {
  const dates = lastNDates(14)
  const byDate = new Map(entries.map((e) => [e.entry_date, e]))

  const W = 340
  const H = 90
  const padX = 6
  const padY = 12
  const innerW = W - padX * 2
  const innerH = H - padY * 2
  const step = innerW / (dates.length - 1)

  // count 0..3 → y (0 embaixo, 3 no topo)
  const points = dates.map((d, i) => {
    const count = focusFor(byDate.get(d)).count
    const x = padX + i * step
    const y = padY + innerH - (count / 3) * innerH
    return { x, y, count, date: d }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="Foco dos últimos 14 dias">
        {/* linhas-guia (0..3) */}
        {[0, 1, 2, 3].map((lvl) => {
          const y = padY + innerH - (lvl / 3) * innerH
          return <line key={lvl} x1={padX} x2={W - padX} y1={y} y2={y} className={styles.grid} />
        })}
        <path d={path} className={styles.line} />
        {points.map((p) => (
          <circle
            key={p.date}
            cx={p.x}
            cy={p.y}
            r={p.count > 0 ? 3.5 : 2.5}
            className={p.count === 3 ? styles.dotFull : p.count === 0 ? styles.dotEmpty : styles.dot}
          />
        ))}
      </svg>
      <div className={styles.axis}>
        <span>{weekdayLabel(dates[0])}</span>
        <span>hoje</span>
      </div>
    </div>
  )
}
