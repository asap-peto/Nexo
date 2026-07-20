import { useState } from 'react'
import type { WeeklyWeight } from '../types'
import { weekStart, today, daysBetween } from '../lib/dates'
import styles from './WeeklyWeightField.module.css'

function numOrNull(s: string): number | null {
  if (s.trim() === '') return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function WeeklyWeightField({
  weights,
  onSave,
}: {
  weights: WeeklyWeight[]
  onSave: (weekStart: string, kg: number) => Promise<void>
}) {
  const currentWeek = weekStart()
  const thisWeekEntry = weights.find((w) => w.week_start === currentWeek)
  const last = [...weights].sort((a, b) => b.week_start.localeCompare(a.week_start))[0]

  const [value, setValue] = useState<string>(
    thisWeekEntry?.weight_kg != null ? String(thisWeekEntry.weight_kg) : '',
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isSunday = new Date().getDay() === 0
  const missingThisWeek = !thisWeekEntry
  // Sugerir aos domingos, ou qualquer dia se ainda não pesou na semana corrente.
  const suggest = missingThisWeek

  // Aviso sutil de "faz N dias" só quando há histórico e passou tempo suficiente.
  let daysHint: string | null = null
  if (last && missingThisWeek) {
    const d = daysBetween(last.week_start, today())
    if (d >= 6) daysHint = `Faz ${d} dias desde o último peso.`
  }

  async function save() {
    const kg = numOrNull(value)
    if (kg == null) return
    setSaving(true)
    try {
      await onSave(currentWeek, kg)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.title}>Peso da semana</span>
        <span className={styles.badge}>semanal</span>
      </div>

      {daysHint && <p className={styles.hint}>{daysHint}</p>}
      {!daysHint && !suggest && thisWeekEntry?.weight_kg != null && (
        <p className={styles.hint}>Registrado esta semana: {thisWeekEntry.weight_kg} kg.</p>
      )}
      {!daysHint && suggest && (
        <p className={styles.hint}>
          {isSunday ? 'Domingo — bom dia pra pesar.' : 'Você ainda não registrou o peso desta semana.'}{' '}
          Sem pressão.
        </p>
      )}

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          placeholder="kg"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setSaved(false)
          }}
        />
        <button className={styles.btn} onClick={save} disabled={saving || numOrNull(value) == null}>
          {saving ? '…' : saved ? '✓' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
