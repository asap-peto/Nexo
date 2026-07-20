import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { Entry, WeeklyWeight, Workout, Recipe } from './types'
import { getUserCode, clearUserCode } from './lib/userCode'
import { hasSupabase } from './lib/supabase'
import {
  getEntries,
  upsertEntry,
  getWeeklyWeights,
  upsertWeight,
  getWorkouts,
  addWorkout,
  deleteWorkout,
  getCustomRecipes,
  saveRecipe,
  deleteRecipe,
} from './lib/storage'
import { computeStats, computeInsights, type Stats } from './lib/stats'
import { addDays, today, parseISO } from './lib/dates'
import { CodeGate } from './components/CodeGate'
import { Sidebar, type View } from './components/Sidebar'
import { RightPanel } from './components/RightPanel'
import { Overview } from './screens/Overview'
import { Checkin } from './screens/Checkin'
import { Historico } from './screens/Historico'
import { Receitas } from './screens/Receitas'
import styles from './App.module.css'

const EMPTY_STATS: Stats = {
  currentStreak: 0,
  bestStreak: 0,
  focusDays7: 0,
  avgSleep7: null,
  avgStudy7: null,
  workoutMin7: 0,
  workoutCal7: 0,
  workoutCount7: 0,
}

const TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  checkin: 'Check-in de hoje',
  historico: 'Histórico',
  receitas: 'Receitas',
}

// Nome exibido na saudação. Troque aqui para personalizar.
const USER_NAME = 'Peto'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

/** Capitaliza só a primeira letra (evita o Title Case artificial no PT). */
function sentenceCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const DARK_MODE_KEY = 'nexus_dark_mode'

function getInitialDarkMode(): boolean {
  try {
    return localStorage.getItem(DARK_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function App() {
  const [code, setCode] = useState<string | null>(getUserCode())
  const [view, setView] = useState<View>('dashboard')
  const [entries, setEntries] = useState<Entry[]>([])
  const [weights, setWeights] = useState<WeeklyWeight[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([])
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(getInitialDarkMode)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
  }, [darkMode])

  const toggleTheme = useCallback(() => {
    setDarkMode((current) => {
      const next = !current
      try {
        localStorage.setItem(DARK_MODE_KEY, String(next))
      } catch {
        // O tema ainda funciona na sessão atual mesmo sem storage.
      }
      return next
    })
  }, [])

  const load = useCallback(async (userCode: string) => {
    setLoading(true)
    setError(null)
    try {
      const recentSince = addDays(today(), -60)
      const [es, ws, wos, rs] = await Promise.all([
        // Entries are lightweight and drive all-time stats such as best streak.
        getEntries(userCode),
        getWeeklyWeights(userCode),
        getWorkouts(userCode, recentSince),
        getCustomRecipes(userCode),
      ])
      setEntries(es)
      setWeights(ws)
      setWorkouts(wos)
      setCustomRecipes(rs)
      setStats(computeStats(es, wos))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (code) load(code)
  }, [code, load])

  const saveEntry = useCallback(
    async (entry: Entry) => {
      if (!code) return
      await upsertEntry(code, entry)
      await load(code)
    },
    [code, load],
  )

  const saveWeight = useCallback(
    async (weekStart: string, kg: number) => {
      if (!code) return
      await upsertWeight(code, weekStart, kg)
      await load(code)
    },
    [code, load],
  )

  const onAddWorkout = useCallback(
    async (w: Omit<Workout, 'id' | 'entry_date'>) => {
      if (!code) return
      await addWorkout(code, { ...w, entry_date: today() })
      await load(code)
    },
    [code, load],
  )

  const onDeleteWorkout = useCallback(
    async (id: string) => {
      if (!code) return
      await deleteWorkout(code, id)
      await load(code)
    },
    [code, load],
  )

  const onSaveRecipe = useCallback(
    async (recipe: Recipe) => {
      if (!code) return
      await saveRecipe(code, recipe)
      await load(code)
    },
    [code, load],
  )

  const onDeleteRecipe = useCallback(
    async (id: string) => {
      if (!code) return
      await deleteRecipe(code, id)
      await load(code)
    },
    [code, load],
  )

  function logout() {
    clearUserCode()
    setCode(null)
    setEntries([])
    setWeights([])
    setWorkouts([])
    setCustomRecipes([])
    setStats(EMPTY_STATS)
    setView('dashboard')
  }

  if (!code) {
    return <CodeGate onEnter={setCode} />
  }

  const todayEntry = entries.find((e) => e.entry_date === today()) ?? null
  const todayWorkouts = workouts.filter((w) => w.entry_date === today())
  const insights = computeInsights(entries, workouts)
  const showRight = view === 'dashboard'

  const subtitle = sentenceCase(
    view === 'dashboard'
      ? `${parseISO(today()).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}. ${entries.length} dias registrados.`
      : {
          checkin: 'Registre cada foco no seu momento.',
          historico: 'Sua evolução ao longo do tempo.',
          receitas: 'Ideias práticas para o dia a dia.',
        }[view],
  )

  return (
    <div className={styles.app}>
      <Sidebar
        view={view}
        onChange={setView}
        onLogout={logout}
        local={!hasSupabase}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
      />

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.greeting}>
              {view === 'dashboard' ? (
                <>
                  <span className={styles.greetingHi}>{greeting()},</span> {USER_NAME}!
                </>
              ) : (
                TITLES[view]
              )}
            </h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <div className={styles.topActions}>
            <button
              className={`${styles.iconBtn} ${styles.themeBtn}`}
              onClick={toggleTheme}
              role="switch"
              aria-checked={darkMode}
              aria-label="Alternar tema"
              title="Alternar tema"
            >
              {darkMode ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button className={styles.iconBtn} onClick={logout} title="Sair deste dispositivo" aria-label="Sair">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </header>

        {error && <div className={styles.error}>{error}</div>}

        {loading && entries.length === 0 ? (
          <div className={styles.loading}>Carregando…</div>
        ) : (
          <div className={`${styles.grid} ${showRight ? styles.gridWithRight : ''}`}>
            <main className={styles.main}>
              {view === 'dashboard' && (
                <Overview
                  entries={entries}
                  workouts={workouts}
                  stats={stats}
                  insights={insights}
                  todayEntry={todayEntry}
                  todayWorkouts={todayWorkouts}
                  onOpenCheckin={() => setView('checkin')}
                />
              )}
              {view === 'checkin' && (
                <Checkin
                  date={today()}
                  todayEntry={todayEntry}
                  todayWorkouts={todayWorkouts}
                  onSaveEntry={saveEntry}
                  onAddWorkout={onAddWorkout}
                  onDeleteWorkout={onDeleteWorkout}
                />
              )}
              {view === 'historico' && (
                <Historico entries={entries} weights={weights} workouts={workouts} onSaveWeight={saveWeight} />
              )}
              {view === 'receitas' && (
                <Receitas customRecipes={customRecipes} onSaveRecipe={onSaveRecipe} onDeleteRecipe={onDeleteRecipe} />
              )}
            </main>

            {showRight && (
              <div className={styles.rightCol}>
                <RightPanel
                  entries={entries}
                  todayEntry={todayEntry}
                  todayWorkouts={todayWorkouts}
                  onOpenCheckin={() => setView('checkin')}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
