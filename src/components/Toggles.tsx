import styles from './Toggles.module.css'

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
