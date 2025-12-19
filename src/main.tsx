import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// @ts-ignore
import { registerSW } from 'virtual:pwa-register'

// Register PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível. Atualizar?')) {
      updateSW(true);
    }
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
