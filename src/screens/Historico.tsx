import type { Entry, WeeklyWeight, Workout } from '../types'
import { CalendarGrid } from '../components/CalendarGrid'
import { WeightChart } from '../components/WeightChart'
import { WorkoutChart } from '../components/WorkoutChart'
import { WeeklyWeightField } from '../components/WeeklyWeightField'

export function Historico({
  entries,
  weights,
  workouts,
  onSaveWeight,
}: {
  entries: Entry[]
  weights: WeeklyWeight[]
  workouts: Workout[]
  onSaveWeight: (weekStart: string, kg: number) => Promise<void>
}) {
  return (
    <>
      <section className="card">
        <p className="card-title">Últimos 30 dias</p>
        <p className="section-hint">Cor = quantos dos 3 focos você cumpriu em cada dia.</p>
        <CalendarGrid entries={entries} />
      </section>

      <section className="card">
        <WeeklyWeightField weights={weights} onSave={onSaveWeight} />
      </section>

      <section className="card">
        <p className="card-title">Peso semanal ao longo do tempo</p>
        <p className="section-hint">Registrado por semana — variações diárias são só água, não gordura.</p>
        <WeightChart weights={weights} />
      </section>

      <section className="card">
        <p className="card-title">Treino — últimos 14 dias</p>
        <WorkoutChart workouts={workouts} />
      </section>
    </>
  )
}
