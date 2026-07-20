import type { Entry } from '../types'
import { focusFor } from '../lib/stats'
import { lastNDates, shortLabel, weekdayLabel } from '../lib/dates'
import styles from './CalendarGrid.module.css'

const LEVEL_CLASS = ['lvl0', 'lvl1', 'lvl2', 'lvl3'] as const

export function CalendarGrid({ entries }: { entries: Entry[] }) {
  const dates = lastNDates(30)
  const byDate = new Map(entries.map((e) => [e.entry_date, e]))

  return (
    <div>
      <div className={styles.grid}>
        {dates.map((d) => {
          const f = focusFor(byDate.get(d))
          const day = d.slice(-2)
          return (
            <div
              key={d}
              className={`${styles.cell} ${styles[LEVEL_CLASS[f.count]]}`}
              title={`${shortLabel(d)} (${weekdayLabel(d)}) — ${f.count}/3 focos`}
            >
              {day}
            </div>
          )
        })}
      </div>
      <div className={styles.legend}>
        <span>Menos</span>
        {[0, 1, 2, 3].map((l) => (
          <span key={l} className={`${styles.swatch} ${styles[LEVEL_CLASS[l]]}`} />
        ))}
        <span>3 focos</span>
      </div>
    </div>
  )
}
