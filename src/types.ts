export interface Entry {
  entry_date: string // YYYY-MM-DD
  sleep_hours: number | null
  screen_off_before_bed: boolean | null
  read_before_bed: boolean | null
  // Nota subjetiva 1-5. Preferida a uma medida de duração como "resultado" nos
  // insights: duração (ex. horas de sono/estudo) é facilmente confundida por
  // fatores externos do dia (agenda, imprevistos), enquanto uma nota de
  // qualidade reflete melhor o efeito real do hábito.
  sleep_quality: number | null
  study_hours: number | null
  study_focus: number | null // nota subjetiva 1-5 de foco/produtividade no estudo
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
