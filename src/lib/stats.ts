import type { Entry, Workout } from '../types'
import { today, addDays } from './dates'
import { formatHM, hoursToMinutes } from './format'

/**
 * Regras de "foco cumprido", estatísticas e insights de relação. Centralizado
 * aqui de propósito: os limiares são o ponto de calibração mais provável —
 * ajuste só neste arquivo, sem tocar na UI.
 */

// Limiares de referência (ajustáveis)
export const SLEEP_GOAL_MINUTES = 7 * 60 + 30
export const SLEEP_GOAL_HOURS = SLEEP_GOAL_MINUTES / 60
export const STREAK_MIN_FOCUS = 2 // quantos dos 3 focos p/ o dia "contar" no streak
const MIN_COMPARABLE_DAYS = 4
const MIN_SINGLE_RATE_DAYS = 5
const MIN_STUDY_DIFF_MINUTES = 15

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
  const study = studyMinutes != null && studyMinutes > 0
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

  const recentW = workouts.filter((w) => last7.has(w.entry_date))
  const workoutMin7 = sum(recentW.map((w) => w.minutes))
  const workoutCal7 = sum(recentW.map((w) => w.calories))
  const workoutCount7 = recentW.length

  return {
    currentStreak,
    bestStreak,
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

/** Frases curtas que só aparecem quando há dados suficientes para significarem algo. */
export function computeInsights(entries: Entry[]): Insight[] {
  const out: Insight[] = []

  // Sono → estudo
  const sleepStudyDays = entries.filter(hasSleepAndStudy)
  const wellSleptStudy = sleepStudyDays.filter((e) => sleepGoalMet(e))
  const poorSleptStudy = sleepStudyDays.filter((e) => !sleepGoalMet(e))
  if (wellSleptStudy.length >= MIN_COMPARABLE_DAYS && poorSleptStudy.length >= MIN_COMPARABLE_DAYS) {
    const wellStudyAvg = averageMinutes(wellSleptStudy.map((e) => e.study_hours))
    const poorStudyAvg = averageMinutes(poorSleptStudy.map((e) => e.study_hours))
    if (wellStudyAvg != null && poorStudyAvg != null) {
      const diffMinutes = Math.round(wellStudyAvg - poorStudyAvg)
      if (Math.abs(diffMinutes) >= MIN_STUDY_DIFF_MINUTES) {
        const sampleSize = wellSleptStudy.length + poorSleptStudy.length
        out.push({
          icon: '📚',
          text:
            diffMinutes > 0
              ? `Você estuda ${formatHM(diffMinutes / 60)} a mais, em média, nos dias com ≥ 7h30 de sono (${sampleSize} dias comparáveis).`
              : `Você estuda ${formatHM(-diffMinutes / 60)} a menos, em média, nos dias com ≥ 7h30 de sono (${sampleSize} dias comparáveis).`,
        })
      }
    }
  }

  // Sono → sensação de descanso
  const sleepRestDays = entries.filter(hasSleepAndRested)
  const wellSleptRest = sleepRestDays.filter((e) => sleepGoalMet(e))
  const poorSleptRest = sleepRestDays.filter((e) => !sleepGoalMet(e))
  const restedWell = rate(wellSleptRest.map((e) => e.feels_rested))
  const restedPoor = rate(poorSleptRest.map((e) => e.feels_rested))
  if (restedWell != null && wellSleptRest.length >= MIN_SINGLE_RATE_DAYS) {
    const hasComparison = restedPoor != null && poorSleptRest.length >= MIN_COMPARABLE_DAYS
    const sampleSize = wellSleptRest.length + (hasComparison ? poorSleptRest.length : 0)
    out.push({
      icon: '😴',
      text:
        hasComparison
          ? `Você se sente descansado em ${pct(restedWell)} dos dias com ≥ 7h30, contra ${pct(restedPoor!)} quando dorme menos (${sampleSize} dias comparáveis).`
          : `Você se sente descansado em ${pct(restedWell)} dos dias com ≥ 7h30 de sono (${sampleSize} dias registrados).`,
    })
  }

  // Ankis
  const ankiDays = entries.filter((e) => e.did_all_ankis != null)
  const ankiRate = rate(ankiDays.map((e) => e.did_all_ankis))
  if (ankiRate != null && ankiDays.length >= MIN_SINGLE_RATE_DAYS) {
    out.push({ icon: '🃏', text: `Ankis em dia em ${pct(ankiRate)} dos ${ankiDays.length} dias registrados.` })
  }

  return out
}

// ---- helpers ---------------------------------------------------------------

function average(vals: (number | null)[]): number | null {
  const nums = vals.filter((v): v is number => v != null && Number.isFinite(v) && v >= 0 && v <= 24)
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function averageMinutes(vals: (number | null)[]): number | null {
  const minutes = vals.map(hoursToMinutes).filter((v): v is number => v != null)
  if (minutes.length === 0) return null
  return minutes.reduce((a, b) => a + b, 0) / minutes.length
}

function validDuration(hours: number | null): boolean {
  const minutes = hoursToMinutes(hours)
  return minutes != null && minutes <= 24 * 60
}

function hasSleepAndStudy(e: Entry): boolean {
  return validDuration(e.sleep_hours) && validDuration(e.study_hours)
}

function hasSleepAndRested(e: Entry): boolean {
  return validDuration(e.sleep_hours) && e.feels_rested != null
}

function sleepGoalMet(e: Entry): boolean {
  const minutes = hoursToMinutes(e.sleep_hours)
  return minutes != null && minutes >= SLEEP_GOAL_MINUTES
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
