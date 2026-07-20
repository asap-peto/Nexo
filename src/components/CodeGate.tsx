import { useState } from 'react'
import { setUserCode } from '../lib/userCode'
import { hasSupabase } from '../lib/supabase'
import wordmarkUrl from '../assets/nexo-wordmark.svg'
import styles from './CodeGate.module.css'

export function CodeGate({ onEnter }: { onEnter: (code: string) => void }) {
  const [code, setCode] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setUserCode(trimmed)
    onEnter(trimmed)
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={submit}>
        <h1 className={styles.title}>
          <img className={styles.wordmark} src={wordmarkUrl} alt="NEXO" />
        </h1>
        <p className={styles.sub}>
          Digite seu código pessoal para entrar. Ele fica salvo neste dispositivo — você não
          precisa digitar de novo aqui.
        </p>
        <input
          className={styles.input}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ex.: chuva-azul-no-telhado-42"
          autoFocus
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <p className={styles.hint}>
          Use uma frase longa e não óbvia (não "peto123"). É a única coisa que protege seus dados.
        </p>
        <button className={styles.btn} type="submit" disabled={!code.trim()}>
          Entrar
        </button>
        {!hasSupabase && (
          <p className={styles.local}>
            Modo local: sem Supabase configurado, os dados ficam só neste dispositivo (sem
            sincronização).
          </p>
        )}
      </form>
    </div>
  )
}
