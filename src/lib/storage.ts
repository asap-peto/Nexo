import type { Entry, WeeklyWeight, Workout, Recipe } from '../types'
import { supabase, hasSupabase } from './supabase'

/**
 * Camada de dados única usada por toda a UI. Duas implementações trocadas em
 * runtime: Supabase (quando as env vars existem → sync entre dispositivos) ou
 * localStorage (fallback local, sem sync). A UI não sabe qual está ativa.
 */

const ENTRY_COLS =
  'entry_date, sleep_hours, screen_off_before_bed, read_before_bed, sleep_quality, study_hours, study_focus, did_all_ankis, ate_as_planned, notes'
const WORKOUT_COLS = 'id, entry_date, style, minutes, calories'
const RECIPE_COLS = 'id, title, time_min, meal_type, ingredients, steps'

function uuid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// ---- localStorage backend --------------------------------------------------

function lsKey(userId: string, kind: string): string {
  return `habit_${kind}_${userId}`
}

function lsRead<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function lsWrite<T>(key: string, rows: T[]): void {
  localStorage.setItem(key, JSON.stringify(rows))
}

// ---- Entries ---------------------------------------------------------------

export async function getEntries(userId: string, since?: string): Promise<Entry[]> {
  if (hasSupabase && supabase) {
    let q = supabase
      .from('entries')
      .select(ENTRY_COLS)
      .eq('user_id', userId)
      .order('entry_date', { ascending: true })
    if (since) q = q.gte('entry_date', since)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as Entry[]
  }

  return lsRead<Entry>(lsKey(userId, 'entries'))
    .filter((r) => (since ? r.entry_date >= since : true))
    .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
}

export async function upsertEntry(userId: string, entry: Entry): Promise<void> {
  if (hasSupabase && supabase) {
    const { error } = await supabase
      .from('entries')
      .upsert({ user_id: userId, ...entry }, { onConflict: 'user_id,entry_date' })
    if (error) throw error
    return
  }

  const key = lsKey(userId, 'entries')
  const rows = lsRead<Entry>(key)
  const i = rows.findIndex((r) => r.entry_date === entry.entry_date)
  if (i >= 0) rows[i] = entry
  else rows.push(entry)
  lsWrite(key, rows)
}

// ---- Weekly weight ---------------------------------------------------------

export async function getWeeklyWeights(userId: string): Promise<WeeklyWeight[]> {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase
      .from('weekly_weight')
      .select('week_start, weight_kg')
      .eq('user_id', userId)
      .order('week_start', { ascending: true })
    if (error) throw error
    return (data ?? []) as WeeklyWeight[]
  }

  return lsRead<WeeklyWeight>(lsKey(userId, 'weights')).sort((a, b) =>
    a.week_start.localeCompare(b.week_start),
  )
}

export async function upsertWeight(
  userId: string,
  weekStart: string,
  weightKg: number,
): Promise<void> {
  if (hasSupabase && supabase) {
    const { error } = await supabase
      .from('weekly_weight')
      .upsert(
        { user_id: userId, week_start: weekStart, weight_kg: weightKg },
        { onConflict: 'user_id,week_start' },
      )
    if (error) throw error
    return
  }

  const key = lsKey(userId, 'weights')
  const rows = lsRead<WeeklyWeight>(key)
  const i = rows.findIndex((r) => r.week_start === weekStart)
  const row = { week_start: weekStart, weight_kg: weightKg }
  if (i >= 0) rows[i] = row
  else rows.push(row)
  lsWrite(key, rows)
}

// ---- Workouts (vários por dia) ---------------------------------------------

export async function getWorkouts(userId: string, since?: string): Promise<Workout[]> {
  if (hasSupabase && supabase) {
    let q = supabase
      .from('workouts')
      .select(WORKOUT_COLS)
      .eq('user_id', userId)
      .order('entry_date', { ascending: true })
    if (since) q = q.gte('entry_date', since)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as Workout[]
  }

  return lsRead<Workout>(lsKey(userId, 'workouts'))
    .filter((r) => (since ? r.entry_date >= since : true))
    .sort((a, b) => a.entry_date.localeCompare(b.entry_date))
}

export async function addWorkout(userId: string, w: Omit<Workout, 'id'>): Promise<void> {
  if (hasSupabase && supabase) {
    const { error } = await supabase.from('workouts').insert({ user_id: userId, ...w })
    if (error) throw error
    return
  }

  const key = lsKey(userId, 'workouts')
  const rows = lsRead<Workout>(key)
  rows.push({ id: uuid(), ...w })
  lsWrite(key, rows)
}

export async function deleteWorkout(userId: string, id: string): Promise<void> {
  if (hasSupabase && supabase) {
    const { error } = await supabase.from('workouts').delete().eq('user_id', userId).eq('id', id)
    if (error) throw error
    return
  }

  const key = lsKey(userId, 'workouts')
  lsWrite(
    key,
    lsRead<Workout>(key).filter((r) => r.id !== id),
  )
}

// ---- Receitas personalizadas -----------------------------------------------

export async function getCustomRecipes(userId: string): Promise<Recipe[]> {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase
      .from('custom_recipes')
      .select(RECIPE_COLS)
      .eq('user_id', userId)
      .order('title', { ascending: true })
    if (error) throw error
    return ((data ?? []) as Recipe[]).map((r) => ({ ...r, custom: true }))
  }

  return lsRead<Recipe>(lsKey(userId, 'recipes')).map((r) => ({ ...r, custom: true }))
}

export async function saveRecipe(userId: string, recipe: Recipe): Promise<void> {
  const payload = {
    title: recipe.title,
    time_min: recipe.time_min,
    meal_type: recipe.meal_type,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
  }

  if (hasSupabase && supabase) {
    if (recipe.id) {
      const { error } = await supabase
        .from('custom_recipes')
        .update(payload)
        .eq('user_id', userId)
        .eq('id', recipe.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('custom_recipes').insert({ user_id: userId, ...payload })
      if (error) throw error
    }
    return
  }

  const key = lsKey(userId, 'recipes')
  const rows = lsRead<Recipe>(key)
  const i = recipe.id ? rows.findIndex((r) => r.id === recipe.id) : -1
  if (i >= 0) rows[i] = { ...recipe, custom: true }
  else rows.push({ ...recipe, id: uuid(), custom: true })
  lsWrite(key, rows)
}

export async function deleteRecipe(userId: string, id: string): Promise<void> {
  if (hasSupabase && supabase) {
    const { error } = await supabase
      .from('custom_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('id', id)
    if (error) throw error
    return
  }

  const key = lsKey(userId, 'recipes')
  lsWrite(
    key,
    lsRead<Recipe>(key).filter((r) => r.id !== id),
  )
}
