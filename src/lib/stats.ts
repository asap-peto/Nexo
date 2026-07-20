import type { Entry, Workout } from '../types'
import { today, addDays } from './dates'
import { hoursToMinutes } from './format'

/**
 * Regras de "foco cumprido", estatísticas e insights de relação. Centralizado
 * aqui de propósito: os limiares são o ponto de calibração mais provável —
 * ajuste só neste arquivo, sem tocar na UI.
 */

// Limiares de referência (ajustáveis)
export const SLEEP_GOAL_MINUTES = 7 * 60 + 30
export const SLEEP_GOAL_HOURS = SLEEP_GOAL_MINUTES / 60
// Piso mínimo para o estudo "contar" como foco (evita que 5min feche o foco).
export const STUDY_GOAL_MINUTES = 60
export const STUDY_GOAL_HOURS = STUDY_GOAL_MINUTES / 60
export const STREAK_MIN_FOCUS = 2 // quantos dos 3 focos p/ o dia "contar" no streak
const MIN_COMPARABLE_DAYS = 4
const MIN_SINGLE_RATE_DAYS = 5
const MIN_RATING_DIFF = 0.5 // pontos, numa escala de 1-5
const RATING_HIGH_THRESHOLD = 4 // nota >= 4 conta como "boa" ao comparar grupos

export interface FocusBreakdown {
  sleep: boolean
  study: boolean
  food: boolean
  count: number // 0..3
}

export function focusFor(e: Entry | undefined): FocusBreakdown {
  const sleepMinutes = hoursToMinutes(e?.sleep_hours)
  const studyMinutes = hoursToMinutes(e?.study_hours)
  const sleep = sleepMinutes != null && sleepMinutes >= SLEEP_GOAL_MINUTES
  const study = studyMinutes != null && studyMinutes >= STUDY_GOAL_MINUTES
  const food = e != null && e.ate_as_planned === true
  return { sleep, study, food, count: Number(sleep) + Number(study) + Number(food) }
}

function indexByDate(entries: Entry[]): Map<string, Entry> {
  const m = new Map<string, Entry>()
  for (const e of entries) m.set(e.entry_date, e)
  return m
}

export interface Stats {
  currentStreak: number
  bestStreak: number
  focusDays7: number // dias na meta (≥2 focos) nos últimos 7
  avgSleep7: number | null
  avgStudy7: number | null
  workoutMin7: number
  workoutCal7: number
  workoutCount7: number
}

export function computeStats(entries: Entry[], workouts: Workout[]): Stats {
  const byDate = indexByDate(entries)

  // Streak atual: dias consecutivos até hoje com count >= STREAK_MIN_FOCUS.
  // Se hoje ainda não foi preenchido, não zera — começa a contar de ontem.
  let currentStreak = 0
  let cursor = today()
  const todayFocus = focusFor(byDate.get(cursor))
  if (todayFocus.count < STREAK_MIN_FOCUS) cursor = addDays(cursor, -1)
  for (let i = 0; i < 3650; i++) {
    if (focusFor(byDate.get(cursor)).count >= STREAK_MIN_FOCUS) {
      currentStreak++
      cursor = addDays(cursor, -1)
    } else break
  }

  // Melhor streak: varre todos os dias registrados em ordem cronológica.
  const dates = [...byDate.keys()].sort()
  let bestStreak = 0
  let run = 0
  let prev: string | null = null
  for (const d of dates) {
    const ok = focusFor(byDate.get(d)).count >= STREAK_MIN_FOCUS
    if (!ok) {
      run = 0
      prev = d
      continue
    }
    if (prev != null && addDays(prev, 1) === d) run++
    else run = 1
    if (run > bestStreak) bestStreak = run
    prev = d
  }

  // Médias / totais dos últimos 7 dias.
  const last7 = new Set<string>()
  for (let i = 0; i < 7; i++) last7.add(addDays(today(), -i))
  const recent = entries.filter((e) => last7.has(e.entry_date))
  const avgSleep7 = average(recent.map((e) => e.sleep_hours))
  const avgStudy7 = average(recent.map((e) => e.study_hours))

  // Taxa "X/7": quantos dos últimos 7 dias bateram a meta de focos.
  // Métrica mais justa que o streak (um dia perdido não zera tudo).
  let focusDays7 = 0
  for (const d of last7) {
    if (focusFor(byDate.get(d)).count >= STREAK_MIN_FOCUS) focusDays7++
  }

  const recentW = workouts.filter((w) => last7.has(w.entry_date))
  const workoutMin7 = sum(recentW.map((w) => w.minutes))
  const workoutCal7 = sum(recentW.map((w) => w.calories))
  const workoutCount7 = recentW.length

  return {
    currentStreak,
    bestStreak,
    focusDays7,
    avgSleep7,
    avgStudy7,
    workoutMin7,
    workoutCal7,
    workoutCount7,
  }
}

// ---- Insights de relação ---------------------------------------------------

export interface Insight {
  icon: string
  text: string
}

/**
 * Frases curtas que só aparecem quando há dados suficientes. A prioridade é
 * relacionar AÇÃO que o usuário controla (tela-off, leitura, treino) com um
 * RESULTADO SENTIDO por ele — nota de sono, nota de foco no estudo. De
 * propósito NÃO usamos duração (horas de sono/estudo) como desfecho: duração
 * é facilmente confundida por fatores externos do dia (agenda, imprevistos),
 * então atribuir a variação dela ao sono/treino seria enganoso. Notas
 * subjetivas de qualidade sofrem muito menos desse viés.
 * São ordenadas por valor e limitadas a 4 para o card não virar parede.
 */
export function computeInsights(entries: Entry[], workouts: Workout[]): Insight[] {
  const out: Insight[] = []
  const trainedDates = new Set(workouts.map((w) => w.entry_date))

  // 1) Tela desligada 30min antes → nota de sono (alavanca → resultado).
  const screenSleep = avgRatingByFlag(entries, (e) => e.sleep_quality, (e) => e.screen_off_before_bed)
  pushRatingDiff(
    out,
    screenSleep,
    '📵',
    (on, off, n) =>
      `Sua nota de sono é ${on} nas noites em que desliga a tela 30min antes, contra ${off} nas outras (${n} noites comparáveis).`,
  )

  // 2) Boa noite de sono → nota de foco no estudo (o resultado que importa:
  //    não é "estudar mais horas", é estudar melhor no tempo que você tem).
  const sleepStudyFocus = avgRatingByFlag(entries, (e) => e.study_focus, (e) => ratingHigh(e.sleep_quality))
  pushRatingDiff(
    out,
    sleepStudyFocus,
    '📚',
    (on, off, n) =>
      `Sua nota de foco no estudo é ${on} nos dias com nota de sono alta, contra ${off} nos outros (${n} dias comparáveis).`,
  )

  // 3) Treino → nota de foco no estudo no mesmo dia.
  const trainStudyFocus = avgRatingByFlag(entries, (e) => e.study_focus, (e) => trainedDates.has(e.entry_date))
  pushRatingDiff(
    out,
    trainStudyFocus,
    '⚡',
    (on, off, n) =>
      `Sua nota de foco no estudo é ${on} nos dias em que treina, contra ${off} nos que não treina (${n} dias comparáveis).`,
  )

  // 4) Treino → nota de sono da noite seguinte (treino no dia D afeta a noite D→D+1).
  const trainSleepQuality = avgRatingByFlag(entries, (e) => e.sleep_quality, (e) =>
    trainedDates.has(addDays(e.entry_date, -1)),
  )
  pushRatingDiff(
    out,
    trainSleepQuality,
    '🏋️',
    (on, off, n) =>
      `Sua nota de sono é ${on} nas noites depois de treinar, contra ${off} nas outras (${n} noites comparáveis).`,
  )

  // 5) Leu antes de dormir → nota de sono (ação → resultado).
  const readSleep = avgRatingByFlag(entries, (e) => e.sleep_quality, (e) => e.read_before_bed)
  pushRatingDiff(
    out,
    readSleep,
    '📖',
    (on, off, n) => `Sua nota de sono é ${on} nas noites em que lê antes de dormir, contra ${off} nas outras (${n} noites comparáveis).`,
  )

  // 6) Ankis — só uma taxa (prioridade baixa; sai quando há relações mais ricas).
  const ankiDays = entries.filter((e) => e.did_all_ankis != null)
  const ankiRate = rate(ankiDays.map((e) => e.did_all_ankis))
  if (ankiRate != null && ankiDays.length >= MIN_SINGLE_RATE_DAYS) {
    out.push({ icon: '🃏', text: `Ankis em dia em ${pct(ankiRate)} dos ${ankiDays.length} dias registrados.` })
  }

  return out.slice(0, 4)
}

interface RatingDiff {
  onAvg: number
  offAvg: number
  n: number
}

/** Nota alta (>= 4) conta como "boa" ao dividir os dias em dois grupos. */
function ratingHigh(v: number | null): boolean | null {
  return isValidRating(v) ? v >= RATING_HIGH_THRESHOLD : null
}

/** Média de uma nota 1-5 separada por uma flag booleana. */
function avgRatingByFlag(
  entries: Entry[],
  pick: (e: Entry) => number | null,
  flag: (e: Entry) => boolean | null,
): RatingDiff | null {
  const base = entries.filter((e) => isValidRating(pick(e)) && flag(e) != null)
  const on = base.filter((e) => flag(e) === true)
  const off = base.filter((e) => flag(e) === false)
  if (on.length < MIN_COMPARABLE_DAYS || off.length < MIN_COMPARABLE_DAYS) return null
  const onAvg = averageRating(on.map(pick))
  const offAvg = averageRating(off.map(pick))
  if (onAvg == null || offAvg == null) return null
  return { onAvg, offAvg, n: on.length + off.length }
}

function pushRatingDiff(
  out: Insight[],
  cmp: RatingDiff | null,
  icon: string,
  text: (on: string, off: string, n: number) => string,
): void {
  if (!cmp) return
  if (Math.abs(cmp.onAvg - cmp.offAvg) < MIN_RATING_DIFF) return
  out.push({ icon, text: text(fmtRating(cmp.onAvg), fmtRating(cmp.offAvg), cmp.n) })
}

function fmtRating(n: number): string {
  return n.toFixed(1).replace('.', ',')
}

// ---- helpers ---------------------------------------------------------------

function average(vals: (number | null)[]): number | null {
  const nums = vals.filter((v): v is number => v != null && Number.isFinite(v) && v >= 0 && v <= 24)
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function isValidRating(v: number | null): v is number {
  return v != null && Number.isFinite(v) && v >= 1 && v <= 5
}

function averageRating(vals: (number | null)[]): number | null {
  const nums = vals.filter(isValidRating)
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function sum(vals: (number | null)[]): number {
  return vals.reduce<number>((a, b) => a + (b ?? 0), 0)
}

/** Proporção de trues entre valores booleanos não-nulos (0..1), ou null se vazio. */
function rate(vals: (boolean | null)[]): number | null {
  const bools = vals.filter((v): v is boolean => v != null)
  if (bools.length === 0) return null
  return bools.filter(Boolean).length / bools.length
}

function pct(r: number): string {
  return `${Math.round(r * 100)}%`
}
