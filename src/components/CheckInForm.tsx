import { useState } from 'react'
import type { Entry } from '../types'
import { YesNoToggle } from './Toggles'
import styles from './CheckInForm.module.css'

type SectionKey = 'sleep' | 'study' | 'food' | 'notes'

const SECTION_FIELDS: Record<SectionKey, (keyof Entry)[]> = {
  sleep: ['sleep_hours', 'screen_off_before_bed', 'read_before_bed', 'feels_rested'],
  study: ['study_hours', 'did_all_ankis'],
  food: ['ate_as_planned'],
  notes: ['notes'],
}

const SECTION_LABELS: Record<SectionKey, string> = {
  sleep: 'sono',
  study: 'estudo',
  food: 'alimentação',
  notes: 'nota',
}

const SECTION_SAVED_LABELS: Record<SectionKey, string> = {
  sleep: 'Sono salvo',
  study: 'Estudo salvo',
  food: 'Alimentação salva',
  notes: 'Nota salva',
}

const EMPTY: Entry = {
  entry_date: '',
  sleep_hours: null,
  screen_off_before_bed: null,
  read_before_bed: null,
  feels_rested: null,
  study_hours: null,
  did_all_ankis: null,
  ate_as_planned: null,
  notes: null,
}

export function CheckInForm({
  date,
  initial,
  onSave,
}: {
  date: string
  initial: Entry | null
  onSave: (entry: Entry) => Promise<void>
}) {
  const [form, setForm] = useState<Entry>({ ...EMPTY, ...(initial ?? {}), entry_date: date })
  const [saving, setSaving] = useState<SectionKey | null>(null)
  const [saved, setSaved] = useState<Record<SectionKey, boolean>>({
    sleep: false,
    study: false,
    food: false,
    notes: false,
  })

  function patch(section: SectionKey, p: Partial<Entry>) {
    setForm((f) => ({ ...f, ...p }))
    setSaved((current) => ({ ...current, [section]: false }))
  }

  async function saveSection(section: SectionKey) {
    const sectionPatch: Partial<Entry> = {}
    for (const field of SECTION_FIELDS[section]) {
      Object.assign(sectionPatch, { [field]: form[field] })
    }

    setSaving(section)
    try {
      await onSave({ ...EMPTY, ...(initial ?? {}), ...sectionPatch, entry_date: date })
      setSaved((current) => ({ ...current, [section]: true }))
    } finally {
      setSaving(null)
    }
  }

  function saveLabel(section: SectionKey): string {
    if (saving === section) return 'Salvando...'
    if (saved[section]) return SECTION_SAVED_LABELS[section]
    return `Salvar ${SECTION_LABELS[section]}`
  }

  return (
    <div className={styles.wrap}>
      {/* Sono */}
      <section className={`${styles.block} ${styles.focusBlock} ${styles.sleepBlock}`}>
        <div className={styles.blockHead}>
          <span className={styles.dot} style={{ background: 'var(--sleep)' }} />
          <h3 className={styles.blockTitle}>Sono</h3>
          <span className={styles.goal}>meta 7h30</span>
        </div>
        <DurationInput
          label="Tempo dormido"
          value={form.sleep_hours}
          onChange={(value) => patch('sleep', { sleep_hours: value })}
        />
        <YesNoToggle
          label="Tela desligada 30min antes"
          value={form.screen_off_before_bed}
          onChange={(v) => patch('sleep', { screen_off_before_bed: v })}
        />
        <YesNoToggle
          label="Li antes de dormir"
          value={form.read_before_bed}
          onChange={(v) => patch('sleep', { read_before_bed: v })}
        />
        <YesNoToggle
          label="Se sente descansado?"
          value={form.feels_rested}
          onChange={(v) => patch('sleep', { feels_rested: v })}
        />
        <button className={`nb-btn ${styles.sectionSave}`} onClick={() => saveSection('sleep')} disabled={saving != null}>
          {saveLabel('sleep')}
        </button>
      </section>

      {/* Estudo */}
      <section className={`${styles.block} ${styles.focusBlock} ${styles.studyBlock}`}>
        <div className={styles.blockHead}>
          <span className={styles.dot} style={{ background: 'var(--study)' }} />
          <h3 className={styles.blockTitle}>Estudo</h3>
        </div>
        <DurationInput
          label="Tempo estudado"
          value={form.study_hours}
          onChange={(value) => patch('study', { study_hours: value })}
        />
        <YesNoToggle
          label="Fiz todos os Ankis do dia?"
          value={form.did_all_ankis}
          onChange={(v) => patch('study', { did_all_ankis: v })}
        />
        <button className={`nb-btn ${styles.sectionSave}`} onClick={() => saveSection('study')} disabled={saving != null}>
          {saveLabel('study')}
        </button>
      </section>

      {/* Alimentação */}
      <section className={`${styles.block} ${styles.focusBlock} ${styles.foodBlock}`}>
        <div className={styles.blockHead}>
          <span className={styles.dot} style={{ background: 'var(--food)' }} />
          <h3 className={styles.blockTitle}>Alimentação</h3>
        </div>
        <YesNoToggle
          label="Comi conforme o que planejei hoje"
          value={form.ate_as_planned}
          onChange={(v) => patch('food', { ate_as_planned: v })}
        />
        <button className={`nb-btn ${styles.sectionSave}`} onClick={() => saveSection('food')} disabled={saving != null}>
          {saveLabel('food')}
        </button>
      </section>

      {/* Notas */}
      <section className={`${styles.block} ${styles.notesBlock}`}>
        <label className={styles.field}>
          <span className="field-label">Notas (opcional)</span>
          <textarea
            className="notes"
            placeholder="Como foi o dia?"
            value={form.notes ?? ''}
            onChange={(e) => patch('notes', { notes: e.target.value || null })}
          />
        </label>
        <button className={`nb-btn ${styles.sectionSave}`} onClick={() => saveSection('notes')} disabled={saving != null}>
          {saveLabel('notes')}
        </button>
      </section>
    </div>
  )
}

function DurationInput({
  label,
  value,
  onChange,
  maxHours = 24,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  maxHours?: number
}) {
  const totalMinutes = value == null ? null : Math.max(0, Math.round(value * 60))
  const hours = totalMinutes == null ? null : Math.floor(totalMinutes / 60)
  const minutes = totalMinutes == null ? null : totalMinutes % 60

  function update(part: 'hours' | 'minutes', raw: string) {
    const parsed = raw === '' ? null : Number(raw)
    if (parsed != null && !Number.isFinite(parsed)) return

    const currentHours = hours ?? 0
    const currentMinutes = minutes ?? 0
    const nextHours = part === 'hours' ? Math.min(maxHours, Math.max(0, Math.trunc(parsed ?? 0))) : currentHours
    const nextMinutes = part === 'minutes' ? Math.min(59, Math.max(0, Math.trunc(parsed ?? 0))) : currentMinutes
    const otherPart = part === 'hours' ? nextMinutes : nextHours

    if (parsed == null && otherPart === 0) {
      onChange(null)
      return
    }

    const cappedTotal = Math.min(nextHours * 60 + nextMinutes, maxHours * 60)
    onChange(cappedTotal / 60)
  }

  return (
    <fieldset className={styles.durationField}>
      <legend className="field-label">{label}</legend>
      <div className={styles.durationInputs}>
        <label className={styles.durationPart}>
          <span>Horas</span>
          <input
            className="number-input"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            max={maxHours}
            placeholder="0"
            aria-label={`${label}: horas`}
            value={hours ?? ''}
            onChange={(event) => update('hours', event.target.value)}
          />
        </label>
        <label className={styles.durationPart}>
          <span>Minutos</span>
          <input
            className="number-input"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            max="59"
            placeholder="00"
            aria-label={`${label}: minutos`}
            value={minutes ?? ''}
            onChange={(event) => update('minutes', event.target.value)}
          />
        </label>
      </div>
    </fieldset>
  )
}
