import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element #root was not found')
}

// StrictMode is intentionally omitted: its development-only double mount would
// trigger two geolocation lookups and two paid Visual Crossing requests per load.
createRoot(root).render(<App />)
