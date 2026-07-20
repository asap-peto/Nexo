import type { Insight } from '../lib/stats'
import styles from './Insights.module.css'

export function Insights({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <p className={styles.empty}>
        Continue registrando alguns dias — aqui vão aparecer relações entre seu sono, estudo,
        descanso e treino.
      </p>
    )
  }
  return (
    <ul className={styles.list}>
      {insights.map((it, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.icon}>{it.icon}</span>
          <span>{it.text}</span>
        </li>
      ))}
    </ul>
  )
}
