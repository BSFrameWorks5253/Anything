import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { ViewModeProvider } from './context/ViewModeContext'
import { AuthProvider } from './context/AuthContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { DataBusProvider } from './context/DataBusContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ViewModeProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <DataBusProvider>
              <App />
            </DataBusProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ViewModeProvider>
    </ThemeProvider>
  </StrictMode>,
)
