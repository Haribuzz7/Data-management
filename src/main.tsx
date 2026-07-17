import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from '@/hooks/useAuth'
import './assets/fonts/inter.css'
import './index.css'

import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Field connectivity is unreliable — don't hammer retries, and
      // treat cached data as good enough for a while rather than
      // constantly refetching on a weak signal.
      retry: 2,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
