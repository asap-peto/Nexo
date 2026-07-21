import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Só há Supabase configurado quando as duas variáveis existem e não estão vazias.
// Sem isso o app não tem backend/login (ver auth.ts para o fallback de dev).
export const hasSupabase = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, anonKey as string, {
      auth: {
        // Necessário para o login com Google (OAuth):
        persistSession: true, // mantém a sessão salva entre visitas/dispositivos
        autoRefreshToken: true, // renova o token automaticamente
        detectSessionInUrl: true, // lê o retorno do OAuth na URL após o redirect
        flowType: 'pkce',
      },
    })
  : null
