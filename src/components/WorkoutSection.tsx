import { useState } from 'react'
import type { Workout } from '../types'
import { WORKOUT_STYLES, styleLabel, styleEmoji } from '../data/workouts'
import styles from './WorkoutSection.module.css'

function numOrNull(s: string): number | null {
  if (s.trim() === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Treinos do dia. Cada treino é salvo individualmente (permite vários por dia).
 * Não faz parte do "Salvar registro" — persiste na hora que você adiciona.
 */
export function WorkoutSection({
  workouts,
  onAdd,
  onDelete,
}: {
  workouts: Workout[]
  onAdd: (w: Omit<Workout, 'id' | 'entry_date'>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [style, setStyle] = useState<string>('musculacao')
  const [other, setOther] = useState('')
  const [minutes, setMinutes] = useState('')
  const [calories, setCalories] = useState('')
  const [busy, setBusy] = useState(false)

  const isOutro = style === 'outro'
  const resolvedStyle = isOutro ? other.trim() : style
  const canAdd = resolvedStyle !== '' && (numOrNull(minutes) != null || numOrNull(calories) != null)

  async function add() {
    if (!canAdd) return
    setBusy(true)
    try {
      await onAdd({ style: resolvedStyle, minutes: numOrNull(minutes), calories: numOrNull(calories) })
      setMinutes('')
      setCalories('')
      setOther('')
      setStyle('musculacao')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.wrap}>
      {workouts.length > 0 && (
        <ul className={styles.list}>
          {workouts.map((w) => (
            <li key={w.id} className={styles.item}>
              <span className={styles.emoji}>{styleEmoji(w.style)}</span>
              <span className={styles.itemName}>{styleLabel(w.style)}</span>
              <span className={styles.itemMeta}>
                {w.minutes != null && <b>{w.minutes} min</b>}
                {w.minutes != null && w.calories != null && ' · '}
                {w.calories != null && <b>{w.calories} kcal</b>}
              </span>
              <button
                className={styles.del}
                onClick={() => onDelete(w.id)}
                aria-label="Remover treino"
                title="Remover"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.chips}>
        {WORKOUT_STYLES.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`${styles.chip} ${style === s.value ? styles.chipActive : ''}`}
            onClick={() => setStyle(s.value)}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {isOutro && (
        <input
          className={styles.textInput}
          placeholder="Qual treino? (ex.: ciclismo, funcional…)"
          value={other}
          onChange={(e) => setOther(e.target.value)}
        />
      )}

      <div className={styles.numbers}>
        <label className={styles.numField}>
          <span>Minutos</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="—"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>
        <label className={styles.numField}>
          <span>Calorias 🔥</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="—"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </label>
      </div>

      <button className={`nb-btn ${styles.addBtn}`} onClick={add} disabled={!canAdd || busy}>
        {busy ? 'Adicionando…' : '+ Adicionar treino'}
      </button>
    </div>
  )
}
