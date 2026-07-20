import styles from './Toggles.module.css'

/** Nota subjetiva 1-5. `value` pode ser null (ainda não respondido). */
export function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className={styles.ratingWrap}>
      <span className={styles.label}>{label}</span>
      <div className={styles.ratingRow} role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`${styles.ratingBtn} ${value === n ? styles.ratingBtnActive : ''}`}
            onClick={() => onChange(n)}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} de 5`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Toggle sim/não simples. `value` pode ser null (ainda não respondido). */
export function YesNoToggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean | null
  onChange: (v: boolean) => void
}) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles.segment}>
        <button
          type="button"
          className={`${styles.opt} ${value === false ? styles.activeNo : ''}`}
          onClick={() => onChange(false)}
          aria-pressed={value === false}
        >
          Não
        </button>
        <button
          type="button"
          className={`${styles.opt} ${value === true ? styles.activeYes : ''}`}
          onClick={() => onChange(true)}
          aria-pressed={value === true}
        >
          Sim
        </button>
      </div>
    </div>
  )
}

/** Toggle de 2 opções nomeadas (ex.: método Ativo/Passivo). */
export function ChoiceToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string; hint?: string }[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className={styles.choiceWrap}>
      <span className={styles.label}>{label}</span>
      <div className={styles.choiceSegment}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`${styles.choiceOpt} ${value === o.value ? styles.choiceActive : ''}`}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
          >
            <span className={styles.choiceLabel}>{o.label}</span>
            {o.hint && <span className={styles.choiceHint}>{o.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
