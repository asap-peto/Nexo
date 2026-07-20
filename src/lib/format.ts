/**
 * Formata horas decimais como "7h30" (horas + minutos), que é como a gente
 * realmente lê tempo — não "7,5h".
 *   7.5  → "7h30"
 *   2.7  → "2h42"
 *   8    → "8h"
 *   0.5  → "30min"
 */
export function formatHM(hours: number | null | undefined): string {
  const totalMin = hoursToMinutes(hours)
  if (totalMin == null) return '—'
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${String(m).padStart(2, '0')}`
}

/** Converte a representação persistida em horas para minutos inteiros. */
export function hoursToMinutes(hours: number | null | undefined): number | null {
  if (hours == null || !Number.isFinite(hours) || hours < 0) return null
  return Math.round(hours * 60)
}
