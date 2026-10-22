import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { ViewModeProvider } from './context/ViewModeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ViewModeProvider>
        <App />
      </ViewModeProvider>
    </ThemeProvider>
  </StrictMode>,
)
