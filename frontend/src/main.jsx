import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// Apply persisted dark mode before first render
try {
  const stored = JSON.parse(localStorage.getItem('lc-ui') || '{}')
  if (stored?.state?.darkMode) {
    document.documentElement.classList.add('dark')
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
