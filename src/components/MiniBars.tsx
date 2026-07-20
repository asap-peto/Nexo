import styles from './MiniBars.module.css'

/** Sparkline de barras minúsculo para dentro dos MetricCards. */
export function MiniBars({ values, max }: { values: number[]; max?: number }) {
  const top = Math.max(1, max ?? Math.max(...values, 0))
  return (
    <div className={styles.wrap} aria-hidden="true">
      {values.map((v, i) => (
        <span
          key={i}
          className={styles.bar}
          style={{ height: `${Math.max(6, (v / top) * 100)}%`, opacity: v > 0 ? 1 : 0.35 }}
        />
      ))}
    </div>
  )
}
