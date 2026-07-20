import { useMemo, useState } from 'react'
import type { Entry, Workout } from '../types'
import { type Stats, type Insight, focusFor } from '../lib/stats'
import { lastNDates, parseISO, weekdayLabel } from '../lib/dates'
import { formatHM } from '../lib/format'
import { styleLabel, styleEmoji } from '../data/workouts'
import { MetricCard } from '../components/MetricCard'
import { MiniBars } from '../components/MiniBars'
import { ECGLine } from '../components/ECGLine'
import { SleepStudyChart } from '../components/SleepStudyChart'
import { WorkoutChart } from '../components/WorkoutChart'
import { Insights } from '../components/Insights'
import { RightPanel } from '../components/RightPanel'
import styles from './Overview.module.css'

export function Overview({
  entries,
  workouts,
  stats,
  insights,
  todayEntry,
  todayWorkouts,
  onOpenCheckin,
}: {
  entries: Entry[]
  workouts: Workout[]
  stats: Stats
  insights: Insight[]
  todayEntry: Entry | null
  todayWorkouts: Workout[]
  onOpenCheckin: () => void
}) {
  const eByDate = useMemo(() => new Map(entries.map((e) => [e.entry_date, e])), [entries])
  const wByDate = useMemo(() => {
    const m = new Map<string, Workout[]>()
    for (const w of workouts) {
      if (!m.has(w.entry_date)) m.set(w.entry_date, [])
      m.get(w.entry_date)!.push(w)
    }
    return m
  }, [workouts])

  const days7 = lastNDates(7)
  const sonoVals = days7.map((d) => eByDate.get(d)?.sleep_hours ?? 0)
  const estudoVals = days7.map((d) => eByDate.get(d)?.study_hours ?? 0)
  const treinoVals = days7.map((d) => (wByDate.get(d) ?? []).reduce((a, w) => a + (w.minutes ?? 0), 0))

  const recentDays = [...lastNDates(7)].reverse() // hoje primeiro
  const [selected, setSelected] = useState(recentDays[0])
  const selEntry = eByDate.get(selected) ?? null
  const selWorkouts = wByDate.get(selected) ?? []
  const selFocus = focusFor(selEntry ?? undefined)

  const todayFocus = focusFor(eByDate.get(days7[days7.length - 1]) ?? undefined)

  return (
    <div className={styles.wrap}>
      {/* Métricas */}
      <div className={styles.metrics}>
        <MetricCard label="Sono" value={formatHM(stats.avgSleep7)} unit="média 7d" grad="sono" decor="blob">
          <MiniBars values={sonoVals} max={9} />
        </MetricCard>
        <MetricCard label="Estudo" value={formatHM(stats.avgStudy7)} unit="média 7d" grad="estudo" decor="spark">
          <MiniBars values={estudoVals} max={6} />
        </MetricCard>
        <MetricCard
          label="Foco"
          value={`${stats.focusDays7}/7`}
          unit="dias na meta"
          sub={`Streak ${stats.currentStreak} · melhor ${stats.bestStreak}`}
          grad="foco"
          decor="wave"
        >
          <div className={styles.focoDots}>
            {[todayFocus.sleep, todayFocus.study, todayFocus.food].map((ok, i) => (
              <span key={i} className={`${styles.focoDot} ${ok ? styles.focoDotOn : ''}`} />
            ))}
          </div>
        </MetricCard>
        <MetricCard
          label="Treino"
          value={`${stats.workoutMin7}`}
          unit="min · 7d"
          sub={`${stats.workoutCal7} kcal queimadas`}
          grad="treino"
          decor="rings"
        >
          <MiniBars values={treinoVals} />
        </MetricCard>
      </div>

      {/* Calendário + timeline: no mobile/tablet aparece logo após os focos.
          No desktop (≥1080px) ele fica na coluna da direita, então aqui é ocultado. */}
      <div className={styles.inlinePanel}>
        <RightPanel
          entries={entries}
          todayEntry={todayEntry}
          todayWorkouts={todayWorkouts}
          onOpenCheckin={onOpenCheckin}
        />
      </div>

      {/* Insights */}
      <section className="card">
        <p className="card-title">O que os dados dizem</p>
        <Insights insights={insights} />
      </section>

      {/* Gráficos */}
      <div className={styles.chartsRow}>
        <section className="card">
          <p className="card-title">Foco — últimos 14 dias</p>
          <ECGLine entries={entries} />
        </section>
        <section className="card">
          <p className="card-title">Sono × estudo</p>
          <SleepStudyChart entries={entries} />
        </section>
      </div>

      <section className="card">
        <p className="card-title">Treino — últimos 14 dias</p>
        <WorkoutChart workouts={workouts} />
      </section>

      {/* Master / detail */}
      <div className={styles.masterDetail}>
        <section className="card">
          <p className="card-title">Últimos dias</p>
          <ul className={styles.dayList}>
            {recentDays.map((d) => {
              const f = focusFor(eByDate.get(d) ?? undefined)
              const isToday = d === days7[days7.length - 1]
              return (
                <li key={d}>
                  <button
                    className={`${styles.dayRow} ${selected === d ? styles.dayRowActive : ''}`}
                    onClick={() => setSelected(d)}
                  >
                    <div className={styles.dayWhen}>
                      <span className={styles.dayNum}>{d.slice(-2)}</span>
                      <span className={styles.dayDow}>{isToday ? 'hoje' : weekdayLabel(d)}</span>
                    </div>
                    <div className={styles.dayFoci}>
                      {[f.sleep, f.study, f.food].map((ok, i) => (
                        <span key={i} className={`${styles.miniDot} ${ok ? styles.miniDotOn : ''}`} />
                      ))}
                    </div>
                    <span className={styles.dayScore}>{f.count}/3</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="card">
          <p className="card-title">Detalhes do dia</p>
          <div className={styles.detailHead}>
            <h3 className={styles.detailTitle}>
              {parseISO(selected).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <span className={styles.detailScore}>{selFocus.count}/3 focos</span>
          </div>

          {selEntry || selWorkouts.length ? (
            <div className={styles.detailGrid}>
              <DetailRow icon="🌙" label="Sono" value={formatHM(selEntry?.sleep_hours)} />
              <DetailRow icon="🖥️" label="Tela off 30min antes" value={boolTxt(selEntry?.screen_off_before_bed)} />
              <DetailRow icon="📖" label="Leu antes de dormir" value={boolTxt(selEntry?.read_before_bed)} />
              <DetailRow icon="😴" label="Nota do sono" value={ratingTxt(selEntry?.sleep_quality)} />
              <DetailRow icon="📚" label="Estudo" value={formatHM(selEntry?.study_hours)} />
              <DetailRow icon="🎯" label="Nota de foco" value={ratingTxt(selEntry?.study_focus)} />
              <DetailRow icon="🃏" label="Ankis do dia" value={boolTxt(selEntry?.did_all_ankis)} />
              <DetailRow icon="🍽️" label="Alimentação" value={boolTxt(selEntry?.ate_as_planned)} />
              {selWorkouts.map((w) => (
                <DetailRow
                  key={w.id}
                  icon={styleEmoji(w.style)}
                  label={styleLabel(w.style)}
                  value={[w.minutes != null ? `${w.minutes}min` : null, w.calories != null ? `${w.calories}kcal` : null]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                />
              ))}
              {selEntry?.notes && <p className={styles.notes}>“{selEntry.notes}”</p>}
            </div>
          ) : (
            <p className={styles.empty}>Nenhum registro neste dia.</p>
          )}
        </section>
      </div>
    </div>
  )
}

function boolTxt(v: boolean | null | undefined): string {
  return v == null ? '—' : v ? 'Sim' : 'Não'
}

function ratingTxt(v: number | null | undefined): string {
  return v == null ? '—' : `${v}/5`
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailIcon}>{icon}</span>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  )
}
