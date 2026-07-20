import React from 'react'
import ReactDOM from 'react-dom/client'
// Subconjunto "latin" cobre o alfabeto básico + acentos do português (à-ÿ).
// (o "latin-ext" só traz glifos do leste europeu — não renderiza o texto em PT.)
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/manrope/latin-800.css'
import './global.css' // base/tokens primeiro, para os CSS Modules poderem sobrescrever
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registra o service worker só em produção (offline básico do app shell).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* falha silenciosa: PWA offline é conveniência, não requisito */
    })
  })
}
