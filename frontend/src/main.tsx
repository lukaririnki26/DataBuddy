import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store, RootState } from './store'
import { getAppTheme } from './theme/theme'
import './index.css'

console.log('React app starting...');

const Root: React.FC = () => {
  const themeMode = useSelector((state: RootState) => state.ui.theme);
  const theme = useMemo(() => getAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: themeMode === 'dark' ? '#1e293b' : '#fff',
            color: themeMode === 'dark' ? '#fff' : '#1e1e1e',
            borderRadius: '1rem',
            border: `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          },
        }}
      />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Root />
    </Provider>
  </React.StrictMode>,
)
