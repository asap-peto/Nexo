import type { Entry, Workout } from '../types'
import { focusFor } from '../lib/stats'
import { formatHM } from '../lib/format'
import { styleLabel, styleEmoji } from '../data/workouts'
import { MonthCalendar } from './MonthCalendar'
import styles from './RightPanel.module.css'

export function RightPanel({
  entries,
  todayEntry,
  todayWorkouts,
  onOpenCheckin,
}: {
  entries: Entry[]
  todayEntry: Entry | null
  todayWorkouts: Workout[]
  onOpenCheckin: () => void
}) {
  const f = focusFor(todayEntry ?? undefined)

  const items = [
    {
      icon: '🌙',
      name: 'Sono',
      detail: todayEntry?.sleep_hours != null ? `${formatHM(todayEntry.sleep_hours)} dormidas` : 'Sem registro',
      ok: f.sleep,
    },
    {
      icon: '📚',
      name: 'Estudo',
      detail: todayEntry?.study_hours != null ? `${formatHM(todayEntry.study_hours)} estudadas` : 'Sem registro',
      ok: f.study,
    },
    {
      icon: '🍽️',
      name: 'Alimentação',
      detail: todayEntry?.ate_as_planned == null ? 'Sem registro' : f.food ? 'Conforme o plano' : 'Fora do plano',
      ok: f.food,
    },
  ]

  return (
    <div className={styles.panel}>
      <div className="card">
        <MonthCalendar entries={entries} />
        <button className={`nb-btn ${styles.cta}`} onClick={onOpenCheckin}>
          {todayEntry ? 'Editar check-in de hoje' : '+ Fazer check-in de hoje'}
        </button>
      </div>

      <div className="card">
        <div className={styles.timelineHead}>
          <span className={styles.timelineTitle}>Hoje</span>
          <span className={styles.badge}>{f.count}/3 focos</span>
        </div>

        <ul className={styles.timeline}>
          {items.map((it) => (
            <li key={it.name} className={`${styles.item} ${it.ok ? styles.itemOk : ''}`}>
              <span className={styles.dot}>{it.icon}</span>
              <div className={styles.itemBody}>
                <span className={styles.itemName}>{it.name}</span>
                <span className={styles.itemDetail}>{it.detail}</span>
              </div>
              {it.ok && <span className={styles.check}>✓</span>}
            </li>
          ))}

          {todayWorkouts.map((w) => (
            <li key={w.id} className={`${styles.item} ${styles.itemWorkout}`}>
              <span className={styles.dot}>{styleEmoji(w.style)}</span>
              <div className={styles.itemBody}>
                <span className={styles.itemName}>{styleLabel(w.style)}</span>
                <span className={styles.itemDetail}>
                  {[w.minutes != null ? `${w.minutes} min` : null, w.calories != null ? `${w.calories} kcal` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
