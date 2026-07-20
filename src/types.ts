export interface Entry {
  entry_date: string // YYYY-MM-DD
  sleep_hours: number | null
  screen_off_before_bed: boolean | null
  read_before_bed: boolean | null
  feels_rested: boolean | null
  study_hours: number | null
  did_all_ankis: boolean | null
  ate_as_planned: boolean | null
  notes: string | null
}

export interface WeeklyWeight {
  week_start: string // YYYY-MM-DD (domingo)
  weight_kg: number | null
}

export interface Workout {
  id: string
  entry_date: string // YYYY-MM-DD
  style: string // chave de preset (musculacao/natacao/corrida) ou texto livre para "outro"
  minutes: number | null
  calories: number | null
}

export type MealType = 'cafe_da_manha' | 'almoco' | 'janta' | 'lanche'

export interface Recipe {
  id: string
  title: string
  time_min: number
  meal_type: MealType[]
  ingredients: string[]
  steps: string
  custom?: boolean // true = criada/editável pelo usuário; false/undefined = curada (built-in)
}
