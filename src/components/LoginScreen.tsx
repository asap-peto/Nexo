import { useState } from 'react'
import { hasSupabase } from '../lib/supabase'
import { signInWithCode, MIN_CODE_LENGTH, type AppUser } from '../lib/auth'
import wordmarkUrl from '../assets/nexo-wordmark.svg'
import styles from './LoginScreen.module.css'

export function LoginScreen({ onAuthed }: { onAuthed: (user: AppUser) => void }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = code.trim().length >= MIN_CODE_LENGTH

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || busy) return
    setBusy(true)
    setError(null)
    try {
      const user = await signInWithCode(code, name)
      onAuthed(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
      setBusy(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>
          <img className={styles.wordmark} src={wordmarkUrl} alt="NEXO" />
        </h1>
        <p className={styles.sub}>
          Entre com seu código pessoal. Se ainda não existir, ele cria um perfil novo, sincronizado
          entre celular e computador.
        </p>

        <input
          className={styles.input}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Seu código pessoal"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome (opcional)"
        />

        <button className={styles.btn} type="submit" disabled={!canSubmit || busy}>
          {busy ? 'Entrando…' : 'Entrar / criar perfil'}
        </button>

        <p className={styles.hint}>
          Use um código longo e não óbvio (mín. {MIN_CODE_LENGTH} caracteres) — ele é a chave do seu
          perfil. Anote em lugar seguro; sem ele não dá pra recuperar os dados.
        </p>

        {!hasSupabase && (
          <p className={styles.local}>Supabase não configurado — modo local (sem sincronização).</p>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  )
}
