import { useState, type ReactElement } from 'react'
import markUrl from '../assets/nexo-mark.svg'
import wordmarkUrl from '../assets/nexo-wordmark.svg'
import styles from './Sidebar.module.css'

export type View = 'dashboard' | 'checkin' | 'historico' | 'receitas'

const ICONS: Record<string, ReactElement> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  checkin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  historico: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  receitas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
}

const NAV: { id: View; label: string; icon: keyof typeof ICONS }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'checkin', label: 'Check-in de hoje', icon: 'checkin' },
  { id: 'historico', label: 'Histórico', icon: 'historico' },
  { id: 'receitas', label: 'Receitas', icon: 'receitas' },
]

const COLLAPSED_KEY = 'nexus_sidebar_collapsed'

function getInitialCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

export function Sidebar({
  view,
  onChange,
  onLogout,
  local,
  darkMode,
  onToggleTheme,
}: {
  view: View
  onChange: (v: View) => void
  onLogout: () => void
  local: boolean
  darkMode: boolean
  onToggleTheme: () => void
}) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed)

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next))
      } catch {
        // Prefer a working UI even if storage is unavailable.
      }
      return next
    })
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      <div className={styles.brand}>
        <img className={styles.brandMark} src={markUrl} alt="NEXO" width={30} height={30} />
        <img className={styles.brandWordmark} src={wordmarkUrl} alt="NEXO" />
        {local && <span className={styles.localTag}>local</span>}
        <button
          className={styles.collapseBtn}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
          title={collapsed ? 'Expandir sidebar' : 'Minimizar sidebar'}
        >
          <svg
            className={styles.collapseIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <div className={styles.groupLabel}>Geral</div>
      <nav className={styles.nav}>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`${styles.item} ${view === item.id ? styles.itemActive : ''}`}
            onClick={() => onChange(item.id)}
            aria-label={item.label}
            title={collapsed ? item.label : undefined}
          >
            <span className={styles.icon}>{ICONS[item.icon]}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.themeToggle}
          onClick={onToggleTheme}
          role="switch"
          aria-checked={darkMode}
          aria-label="Modo escuro"
          title={collapsed ? 'Modo escuro' : undefined}
        >
          <span className={styles.icon} aria-hidden="true">
            {darkMode ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </span>
          <span className={styles.themeLabel}>Modo escuro</span>
          <span className={`${styles.switchTrack} ${darkMode ? styles.switchOn : ''}`} aria-hidden="true">
            <span className={styles.switchThumb} />
          </span>
        </button>

        <button
          className={`${styles.item} ${styles.logout}`}
          onClick={onLogout}
          aria-label="Sair"
          title={collapsed ? 'Sair' : undefined}
        >
          <span className={styles.icon}>{ICONS.logout}</span>
          <span className={styles.label}>Sair</span>
        </button>
      </div>
    </aside>
  )
}
