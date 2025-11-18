import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PrimeReact from 'primereact/api'
import 'primereact/resources/themes/lara-dark-teal/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import 'quill/dist/quill.snow.css'
import './index.css'
import App from './App.tsx'

PrimeReact.ripple = true

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
