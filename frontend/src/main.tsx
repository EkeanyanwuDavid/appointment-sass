import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/index'
import { Toaster } from 'sonner'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        toastOptions={{
          className: '!text-sm !font-medium',
          style: {
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '500',
            padding: '12px 16px',
            minWidth: '320px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          },
        }}
      />{' '}
    </Provider>
  </StrictMode>
)
