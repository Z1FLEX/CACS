import { createBrowserRouter, Navigate } from 'react-router-dom'
import GeneralError from './pages/errors/general-error.tsx'
import NotFoundError from './pages/errors/not-found-error.tsx'
import MaintenanceError from './pages/errors/maintenance-error.tsx'
import UnauthorisedError from './pages/errors/unauthorised-error.tsx'

const router = createBrowserRouter([
  // ========== Auth routes first (no layout) – so /sign-in is reachable ==========
  {
    path: '/sign-in',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in.tsx')).default,
    }),
  },
  {
    path: '/sign-in-2',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in-2.tsx')).default,
    }),
  },
  {
    path: '/sign-up',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-up.tsx')).default,
    }),
  },
  {
    path: '/forgot-password',
    lazy: async () => ({
      Component: (await import('./pages/auth/forgot-password.tsx')).default,
    }),
  },
  {
    path: '/otp',
    lazy: async () => ({
      Component: (await import('./pages/auth/otp.tsx')).default,
    }),
  },

  // ========== Main app (SCAS) – routes shown in sidebar ==========
  {
    path: '/',
    lazy: async () => {
      const AppShell = await import('./components/app-shell.tsx')
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
          Component: (await import('./pages/scas/layout.tsx')).default,
        }),
        children: [
          {
            path: 'dashboard',
            lazy: async () => ({
              Component: (await import('./pages/scas/dashboard.tsx')).default,
            }),
          },
          {
            path: 'users',
            lazy: async () => ({
              Component: (await import('./pages/scas/users.tsx')).default,
            }),
          },
          {
            path: 'access-cards',
            lazy: async () => ({
              Component: (await import('./pages/scas/access-cards.tsx')).default,
            }),
          },
          {
            path: 'zones',
            lazy: async () => ({
              Component: (await import('./pages/scas/zones.tsx')).default,
            }),
          },
          {
            path: 'doors-devices',
            lazy: async () => ({
              Component: (await import('./pages/scas/doors-devices.tsx')).default,
            }),
          },
          {
            path: 'access-profiles',
            lazy: async () => ({
              Component: (await import('./pages/scas/access-profiles.tsx')).default,
            }),
          },
          {
            path: 'schedules',
            lazy: async () => ({
              Component: (await import('./pages/scas/schedules.tsx')).default,
            }),
          },
          {
            path: 'access-logs',
            lazy: async () => ({
              Component: (await import('./pages/scas/access-logs.tsx')).default,
            }),
          },
          {
            path: 'audit-logs',
            lazy: async () => ({
              Component: (await import('./pages/scas/audit-logs.tsx')).default,
            }),
          },
        ],
      },
      {
        path: 'settings',
        lazy: async () => ({
          Component: (await import('./pages/settings/index.tsx')).default,
        }),
        errorElement: <GeneralError />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/settings/profile/index.tsx')).default,
            }),
          },
          {
            path: 'notifications',
            lazy: async () => ({
              Component: (await import('./pages/settings/notifications/index.tsx'))
                .default,
            }),
          },
          {
            path: 'appearance',
            lazy: async () => ({
              Component: (await import('./pages/settings/appearance/index.tsx')).default,
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
