import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { GuestAuthProvider } from './context/GuestAuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GuestAuthProvider>
        <App />
      </GuestAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)