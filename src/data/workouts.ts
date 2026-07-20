export interface WorkoutStyleDef {
  value: string
  label: string
  color: string
  emoji: string
}

// Estilos de treino oferecidos. "outro" abre um campo de texto livre.
export const WORKOUT_STYLES: WorkoutStyleDef[] = [
  { value: 'musculacao', label: 'Musculação', color: 'var(--c-blue)', emoji: '🏋️' },
  { value: 'natacao', label: 'Natação', color: 'var(--c-sky)', emoji: '🏊' },
  { value: 'corrida', label: 'Corrida', color: 'var(--c-amber)', emoji: '🏃' },
  { value: 'outro', label: 'Outro', color: 'var(--c-pink)', emoji: '✨' },
]

const BY_VALUE = new Map(WORKOUT_STYLES.map((s) => [s.value, s]))

/** Rótulo de exibição para um estilo salvo (preset → label; caso contrário o texto livre). */
export function styleLabel(style: string): string {
  return BY_VALUE.get(style)?.label ?? style
}

/** Cor associada a um estilo (presets têm cor própria; texto livre usa a cor de "outro"). */
export function styleColor(style: string): string {
  return BY_VALUE.get(style)?.color ?? 'var(--c-pink)'
}

export function styleEmoji(style: string): string {
  return BY_VALUE.get(style)?.emoji ?? '✨'
}
