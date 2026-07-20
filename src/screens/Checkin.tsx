import type { Entry, Workout } from '../types'
import { CheckInForm } from '../components/CheckInForm'
import { WorkoutSection } from '../components/WorkoutSection'
import styles from './Checkin.module.css'

export function Checkin({
  date,
  todayEntry,
  todayWorkouts,
  onSaveEntry,
  onAddWorkout,
  onDeleteWorkout,
}: {
  date: string
  todayEntry: Entry | null
  todayWorkouts: Workout[]
  onSaveEntry: (e: Entry) => Promise<void>
  onAddWorkout: (w: Omit<Workout, 'id' | 'entry_date'>) => Promise<void>
  onDeleteWorkout: (id: string) => Promise<void>
}) {
  return (
    <>
      <section className={styles.entrySection}>
        <div className={styles.intro}>
          <p className="card-title">Focos de hoje</p>
          <p className="section-hint">Registre cada foco no momento em que ele acontecer.</p>
        </div>
        <CheckInForm date={date} initial={todayEntry} onSave={onSaveEntry} />
      </section>

      <section className={`card ${styles.workoutCard}`}>
        <p className="card-title">Treino de hoje</p>
        <p className="section-hint">Adicione quantos treinos fizer no dia — cada um é salvo na hora.</p>
        <WorkoutSection workouts={todayWorkouts} onAdd={onAddWorkout} onDelete={onDeleteWorkout} />
      </section>
    </>
  )
}
