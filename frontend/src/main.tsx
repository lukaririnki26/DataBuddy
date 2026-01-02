import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme/theme' // Import centralized theme
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import { store } from './store'
import './index.css'

// Theme imported from ./theme/theme.ts

console.log('React app starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
