import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// MC-211: robot avatar design tokens (frame sizes, status colors, motion —
// reduced-motion safe). Loaded once at app entry per the MC-210 guide.
import './design/avatars/tokens.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
