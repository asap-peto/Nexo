import type { ReactNode } from 'react'
import styles from './MetricCard.module.css'

export type Decor = 'blob' | 'spark' | 'rings' | 'wave'
export type GradKey = 'sono' | 'estudo' | 'treino' | 'foco'

const DECOR: Record<Decor, ReactNode> = {
  blob: (
    <path d="M40 4c18 0 34 12 34 32S60 74 38 74 4 58 4 38 22 4 40 4z" fill="rgba(255,255,255,0.16)" />
  ),
  spark: (
    <path
      d="M40 2l8 24 24 8-24 8-8 24-8-24-24-8 24-8z"
      fill="rgba(255,255,255,0.16)"
    />
  ),
  rings: (
    <>
      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
      <circle cx="40" cy="40" r="18" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="6" />
    </>
  ),
  wave: (
    <path
      d="M0 44c12-20 28-20 40 0s28 20 40 0V80H0z"
      fill="rgba(255,255,255,0.16)"
    />
  ),
}

export function MetricCard({
  label,
  value,
  unit,
  sub,
  grad,
  decor,
  children,
}: {
  label: string
  value: string
  unit?: string
  sub?: string
  grad: GradKey
  decor: Decor
  children?: ReactNode
}) {
  return (
    <div className={`${styles.card} ${styles[grad]}`}>
      <svg className={styles.decor} viewBox="0 0 80 80" aria-hidden="true">
        {DECOR[decor]}
      </svg>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
      {sub && <span className={styles.sub}>{sub}</span>}
      {children && <div className={styles.chart}>{children}</div>}
    </div>
  )
}
