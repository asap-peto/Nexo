import type { Session } from '@supabase/supabase-js'
import { supabase, hasSupabase } from './supabase'

/**
 * Autenticação por CÓDIGO PESSOAL, mas com login de verdade (não é só um filtro).
 * O código é transformado num e-mail interno + senha do Supabase Auth, então cada
 * código = um usuário real, com dados isolados por RLS (auth.uid() = user_id).
 * Sem Google. Em dev sem Supabase, guarda um perfil local só para ver a UI.
 *
 * ⚠️ Requer, no painel do Supabase, DESLIGAR a confirmação de e-mail
 * (Authentication → Providers → Email → "Confirm email" OFF), senão o cadastro
 * não devolve sessão e o login pelo código não conclui.
 */

const EMAIL_DOMAIN = 'nexo.app'
const LOCAL_USER_KEY = 'nexo_local_user'
const LOCAL_NAMES_KEY = 'nexo_local_names'
export const MIN_CODE_LENGTH = 6

export interface AppUser {
  id: string
  name: string | null
  email: string | null
  avatarUrl: string | null
}

function slug(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function emailForCode(code: string): string {
  return `${slug(code)}@${EMAIL_DOMAIN}`
}

function firstName(name: string | null): string | null {
  return name ? name.trim().split(/\s+/)[0] : null
}

/** Primeiro nome amigável para a saudação. */
export function displayName(user: AppUser): string | null {
  return firstName(user.name)
}

function mapUser(session: Session | null): AppUser | null {
  const u = session?.user
  if (!u) return null
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>
  return {
    id: u.id,
    name: (meta.display_name as string) ?? (meta.full_name as string) ?? null,
    email: u.email ?? null,
    avatarUrl: null,
  }
}

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!hasSupabase || !supabase) return readLocalUser()
  const { data } = await supabase.auth.getSession()
  return mapUser(data.session)
}

/** Assina mudanças de sessão (login/logout). Retorna função para cancelar. */
export function onAuthChange(cb: (user: AppUser | null) => void): () => void {
  if (!hasSupabase || !supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(mapUser(session))
  })
  return () => data.subscription.unsubscribe()
}

/**
 * Entra com um código. Se o código ainda não existe, cria o perfil na hora
 * (login = criação). `name` é opcional e usado na saudação.
 */
export async function signInWithCode(code: string, name?: string): Promise<AppUser> {
  const trimmed = code.trim()
  if (trimmed.length < MIN_CODE_LENGTH) {
    throw new Error(`O código precisa ter pelo menos ${MIN_CODE_LENGTH} caracteres.`)
  }

  if (!hasSupabase || !supabase) return signInLocal(trimmed, name)

  const email = emailForCode(trimmed)
  const password = trimmed
  const displayNameMeta = name?.trim() ? { display_name: name.trim(), full_name: name.trim() } : undefined

  // 1) Tenta entrar (perfil já existe).
  let session: Session | null = null
  const signIn = await supabase.auth.signInWithPassword({ email, password })
  if (signIn.error) {
    // 2) Não existe → cria o perfil.
    const signUp = await supabase.auth.signUp({
      email,
      password,
      options: displayNameMeta ? { data: displayNameMeta } : undefined,
    })
    if (signUp.error) throw new Error(translateAuthError(signUp.error.message))
    if (!signUp.data.session) {
      throw new Error(
        'A confirmação de e-mail está ligada no Supabase. Desligue em Authentication → Providers → Email ("Confirm email") para o código funcionar como login.',
      )
    }
    session = signUp.data.session
  } else {
    session = signIn.data.session
  }

  const user = mapUser(session)
  if (!user) throw new Error('Não foi possível entrar.')

  // Atualiza o nome se foi informado e mudou.
  if (name?.trim() && user.name !== name.trim()) {
    await supabase.auth.updateUser({ data: { display_name: name.trim(), full_name: name.trim() } })
    user.name = name.trim()
  }

  return user
}

export async function signOut(): Promise<void> {
  if (hasSupabase && supabase) {
    await supabase.auth.signOut()
    return
  }
  clearLocalUser()
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('at least') || m.includes('password')) {
    return `O código precisa ter pelo menos ${MIN_CODE_LENGTH} caracteres.`
  }
  if (m.includes('signups not allowed') || m.includes('disabled')) {
    return 'Cadastro desativado no Supabase. Ative "Allow new users to sign up" nas configurações de Auth.'
  }
  return msg
}

// ---- Fallback local (dev sem Supabase): perfil por código, sem sync ---------

function readLocalUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY)
    return raw ? (JSON.parse(raw) as AppUser) : null
  } catch {
    return null
  }
}

function signInLocal(code: string, name?: string): AppUser {
  const id = `local-${slug(code)}`
  // Em produção o nome vem da conta; no local, lembramos por código.
  const resolved = name?.trim() || recallLocalName(id)
  if (resolved) rememberLocalName(id, resolved)
  const u: AppUser = { id, name: resolved || null, email: null, avatarUrl: null }
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(u))
  } catch {
    // segue sem persistir
  }
  return u
}

function readLocalNames(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_NAMES_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function recallLocalName(id: string): string | null {
  return readLocalNames()[id] ?? null
}

function rememberLocalName(id: string, name: string): void {
  try {
    const map = readLocalNames()
    map[id] = name
    localStorage.setItem(LOCAL_NAMES_KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

function clearLocalUser(): void {
  try {
    localStorage.removeItem(LOCAL_USER_KEY)
  } catch {
    // ignore
  }
}
