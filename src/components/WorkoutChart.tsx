import type { Workout } from '../types'
import { lastNDates, shortLabel } from '../lib/dates'
import { styleColor, styleLabel } from '../data/workouts'
import styles from './WorkoutChart.module.css'

/** Minutos de treino por dia (14 dias), barras empilhadas por estilo. */
export function WorkoutChart({ workouts }: { workouts: Workout[] }) {
  const dates = lastNDates(14)
  const byDate = new Map<string, Workout[]>()
  for (const w of workouts) {
    if (!byDate.has(w.entry_date)) byDate.set(w.entry_date, [])
    byDate.get(w.entry_date)!.push(w)
  }

  const totalPerDay = dates.map((d) => (byDate.get(d) ?? []).reduce((a, w) => a + (w.minutes ?? 0), 0))
  const maxMin = Math.max(60, ...totalPerDay)

  const W = 340
  const H = 130
  const padX = 8
  const padTop = 8
  const padBottom = 18
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom
  const slot = innerW / dates.length
  const barW = Math.min(18, slot * 0.62)

  const stylesPresent = [...new Set(workouts.map((w) => w.style))]
  const hasData = workouts.length > 0

  return (
    <div>
      {hasData ? (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="Minutos de treino (14 dias)">
            {[0.5, 1].map((f) => {
              const y = padTop + innerH - f * innerH
              return <line key={f} x1={padX} x2={W - padX} y1={y} y2={y} className={styles.grid} />
            })}
            {dates.map((d, i) => {
              const list = byDate.get(d) ?? []
              const x = padX + i * slot + (slot - barW) / 2
              let acc = 0
              return list.map((w, k) => {
                const h = ((w.minutes ?? 0) / maxMin) * innerH
                const y = padTop + innerH - acc - h
                acc += h
                return (
                  <rect
                    key={`${d}-${k}`}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(0, h)}
                    rx={2}
                    fill={styleColor(w.style)}
                    stroke="rgba(0,0,0,0.35)"
                    strokeWidth={1.5}
                  />
                )
              })
            })}
          </svg>
          <div className={styles.axis}>
            <span>{shortLabel(dates[0])}</span>
            <span>{shortLabel(dates[dates.length - 1])}</span>
          </div>
          <div className={styles.legend}>
            {stylesPresent.map((s) => (
              <span key={s} className={styles.legItem}>
                <span className={styles.swatch} style={{ background: styleColor(s) }} />
                {styleLabel(s)}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className={styles.empty}>Registre treinos no check-in para ver o histórico aqui.</p>
      )}
    </div>
  )
}
