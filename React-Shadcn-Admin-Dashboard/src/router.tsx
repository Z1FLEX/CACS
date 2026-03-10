import { createBrowserRouter, Navigate } from 'react-router-dom'
import GeneralError from './pages/errors/general-error'
import NotFoundError from './pages/errors/not-found-error'
import MaintenanceError from './pages/errors/maintenance-error'
import UnauthorisedError from './pages/errors/unauthorised-error.tsx'

const router = createBrowserRouter([
  // ========== Auth routes first (no layout) – so /sign-in is reachable ==========
  {
    path: '/sign-in',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in')).default,
    }),
  },
  {
    path: '/sign-in-2',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in-2')).default,
    }),
  },
  {
    path: '/sign-up',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-up')).default,
    }),
  },
  {
    path: '/forgot-password',
    lazy: async () => ({
      Component: (await import('./pages/auth/forgot-password')).default,
    }),
  },
  {
    path: '/otp',
    lazy: async () => ({
      Component: (await import('./pages/auth/otp')).default,
    }),
  },

  // ========== Main app (SCAS) – routes shown in sidebar ==========
  {
    path: '/',
    lazy: async () => {
      const AppShell = await import('./components/app-shell')
      return { Component: AppShell.default }
    },
    errorElement: <GeneralError />,
    children: [
      {
        index: true,
        element: <Navigate to='/scas/dashboard' replace />,
      },
      {
        path: 'scas',
        lazy: async () => ({
          Component: (await import('./pages/scas/layout')).default,
        }),
        children: [
          {
            path: 'dashboard',
            lazy: async () => ({
              Component: (await import('./pages/scas/dashboard')).default,
            }),
          },
          {
            path: 'users',
            lazy: async () => ({
              Component: (await import('./pages/scas/users')).default,
            }),
          },
          {
            path: 'access-cards',
            lazy: async () => ({
              Component: (await import('./pages/scas/access-cards')).default,
            }),
          },
          {
            path: 'zones',
            lazy: async () => ({
              Component: (await import('./pages/scas/zones')).default,
            }),
          },
          {
            path: 'doors-devices',
            lazy: async () => ({
              Component: (await import('./pages/scas/doors-devices')).default,
            }),
          },
          {
            path: 'access-profiles',
            lazy: async () => ({
              Component: (await import('./pages/scas/access-profiles')).default,
            }),
          },
          {
            path: 'schedules',
            lazy: async () => ({
              Component: (await import('./pages/scas/schedules')).default,
            }),
          },
          {
            path: 'access-logs',
            lazy: async () => ({
              Component: (await import('./pages/scas/access-logs')).default,
            }),
          },
          {
            path: 'audit-logs',
            lazy: async () => ({
              Component: (await import('./pages/scas/audit-logs')).default,
            }),
          },
        ],
      },
      {
        path: 'settings',
        lazy: async () => ({
          Component: (await import('./pages/settings')).default,
        }),
        errorElement: <GeneralError />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/settings/profile')).default,
            }),
          },
          {
            path: 'notifications',
            lazy: async () => ({
              Component: (await import('./pages/settings/notifications'))
                .default,
            }),
          },
          {
            path: 'appearance',
            lazy: async () => ({
              Component: (await import('./pages/settings/appearance')).default,
            }),
          },
        ],
      },
    ],
  },

  { path: '/500', Component: GeneralError },
  { path: '/404', Component: NotFoundError },
  { path: '/503', Component: MaintenanceError },
  { path: '/401', Component: UnauthorisedError },

  { path: '*', Component: NotFoundError },
])

export default router
