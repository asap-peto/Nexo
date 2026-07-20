import { useState } from 'react'
import type { Entry } from '../types'
import { focusFor } from '../lib/stats'
import { toISODate, today } from '../lib/dates'
import styles from './MonthCalendar.module.css'

const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] // seg..dom
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const LEVEL = ['lvl0', 'lvl1', 'lvl2', 'lvl3'] as const

export function MonthCalendar({ entries }: { entries: Entry[] }) {
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const byDate = new Map(entries.map((e) => [e.entry_date, e]))
  const todayIso = today()

  const first = new Date(ym.y, ym.m, 1)
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
  // deslocamento com segunda = 0
  const startOffset = (first.getDay() + 6) % 7

  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function shift(delta: number) {
    setYm(({ y, m }) => {
      const nm = m + delta
      return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 }
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <button className={styles.nav} onClick={() => shift(-1)} aria-label="Mês anterior">
          ‹
        </button>
        <span className={styles.title}>
          {MONTHS[ym.m]} {ym.y}
        </span>
        <button className={styles.nav} onClick={() => shift(1)} aria-label="Próximo mês">
          ›
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <span key={i} className={styles.dow}>
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d == null) return <span key={i} />
          const iso = toISODate(new Date(ym.y, ym.m, d))
          const f = focusFor(byDate.get(iso))
          const isToday = iso === todayIso
          return (
            <span
              key={i}
              className={`${styles.day} ${styles[LEVEL[f.count]]} ${isToday ? styles.today : ''}`}
              title={`${iso} — ${f.count}/3 focos`}
            >
              {d}
            </span>
          )
        })}
      </div>
    </div>
  )
}
