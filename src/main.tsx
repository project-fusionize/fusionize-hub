import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@xyflow/react/dist/style.css";
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/ui/theme-provider.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
