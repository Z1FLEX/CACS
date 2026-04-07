import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { RoleProvider } from '@/contexts/RoleContext'
import { AuthProvider } from '@/contexts/AuthContext'
import router from '@/router'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <AuthProvider>
        <RoleProvider>
          <RouterProvider router={router} />
        </RoleProvider>
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
)
