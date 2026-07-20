// Helpers de data trabalhando sempre em horário local, formato YYYY-MM-DD.

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function today(): string {
  return toISODate(new Date())
}

/** Converte YYYY-MM-DD para Date local (meia-noite). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Domingo da semana que contém a data dada (início da semana). */
export function weekStart(d: Date = new Date()): string {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  copy.setDate(copy.getDate() - copy.getDay()) // getDay(): 0 = domingo
  return toISODate(copy)
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/** Diferença em dias inteiros entre duas datas ISO (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = parseISO(b).getTime() - parseISO(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** Lista de N datas ISO terminando hoje (mais antiga primeiro). */
export function lastNDates(n: number, end: string = today()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i))
  return out
}

const WEEKDAY_LABELS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function weekdayLabel(iso: string): string {
  return WEEKDAY_LABELS[parseISO(iso).getDay()]
}

/** Rótulo curto tipo "19/07". */
export function shortLabel(iso: string): string {
  const d = parseISO(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}
