import type { Entry } from '../types'
import { lastNDates, shortLabel } from '../lib/dates'
import styles from './SleepStudyChart.module.css'

/**
 * Sono x horas de estudo nos últimos 14 dias, sobrepostos, para o usuário
 * perceber visualmente se dormir mais está ligado a estudar mais no dia.
 * Cada série tem sua própria escala (eixos independentes) — o interesse é o
 * padrão relativo, não comparar horas absolutas de sono com horas de estudo.
 */
export function SleepStudyChart({ entries }: { entries: Entry[] }) {
  const dates = lastNDates(14)
  const byDate = new Map(entries.map((e) => [e.entry_date, e]))
  const sleep = dates.map((d) => byDate.get(d)?.sleep_hours ?? null)
  const study = dates.map((d) => byDate.get(d)?.study_hours ?? null)

  const W = 340
  const H = 130
  const padX = 8
  const padTop = 10
  const padBottom = 18
  const innerW = W - padX * 2
  const innerH = H - padTop - padBottom
  const step = innerW / (dates.length - 1)

  const maxSleep = Math.max(9, ...sleep.filter((v): v is number => v != null))
  const maxStudy = Math.max(4, ...study.filter((v): v is number => v != null))

  function build(series: (number | null)[], max: number): string {
    let d = ''
    let started = false
    series.forEach((v, i) => {
      if (v == null) {
        started = false
        return
      }
      const x = padX + i * step
      const y = padTop + innerH - (v / max) * innerH
      d += `${started ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `
      started = true
    })
    return d.trim()
  }

  function dots(series: (number | null)[], max: number, cls: string) {
    return series.map((v, i) => {
      if (v == null) return null
      const x = padX + i * step
      const y = padTop + innerH - (v / max) * innerH
      return <circle key={i} cx={x} cy={y} r={2.6} className={cls} />
    })
  }

  const hasData = sleep.some((v) => v != null) || study.some((v) => v != null)

  return (
    <div>
      <div className={styles.legend}>
        <span className={styles.legSleep}>● Sono</span>
        <span className={styles.legStudy}>● Estudo</span>
      </div>
      {hasData ? (
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label="Sono x estudo (14 dias)">
          <path d={build(sleep, maxSleep)} className={styles.sleepLine} />
          <path d={build(study, maxStudy)} className={styles.studyLine} />
          {dots(sleep, maxSleep, styles.sleepDot)}
          {dots(study, maxStudy, styles.studyDot)}
        </svg>
      ) : (
        <p className={styles.empty}>Registre alguns dias para ver a relação sono × estudo.</p>
      )}
      <div className={styles.axis}>
        <span>{shortLabel(dates[0])}</span>
        <span>{shortLabel(dates[dates.length - 1])}</span>
      </div>
    </div>
  )
}
