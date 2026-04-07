# React Shadcn Admin Dashboard (SCAS)

A **SCAS (Smart Card Access System)** admin dashboard built with React, Shadcn UI, and TypeScript. The app manages users, access cards, zones, doors & devices, access profiles, schedules, and logs. The project started from a generic admin template; template pages are kept in the router for component reference but are not linked in the main navigation.

## Main app (in sidebar)

- **Home** → `/` (SCAS dashboard)
- **Dashboard** → `/scas/dashboard`
- **Users** → `/scas/users`
- **Access Cards** → `/scas/access-cards`
- **Zones** → `/scas/zones`
- **Doors & Devices** → `/scas/doors-devices`
- **Access Profiles** → `/scas/access-profiles`
- **Schedules** → `/scas/schedules`
- **Access Logs** → `/scas/access-logs`
- **Admin Audit Logs** → `/scas/audit-logs` (ADMIN)
- **System Status** → `/scas/system-status` (ADMIN)
- **Settings** → `/settings`

## Template routes (not in nav)

These routes are still in `src/router.tsx` for reusing components/patterns. They are not linked in the sidebar. Paths: `/kanban`, `/product`, `/dashboard`, `/chats`, `/order`, `/calendar`, `/emails`, `/tasks`, `/supports`, `/users`.

See **PROJECT.md** for data layer and backend integration notes.

## Tech stack

- **React 18** + **TypeScript**
- **Shadcn UI** + **Tailwind CSS**
- **React Router** (lazy-loaded routes)
- **Auth**: `AuthContext`, `ProtectedRoute`, `RoleProvider` (ADMIN / RESPONSABLE / USER)
- **Data**: in-memory store + mock data in `src/data/` (to be replaced by backend API)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — TypeScript check + production build
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Backend integration

The UI is ready for a real backend. All SCAS CRUD goes through:

- **`src/data/scas-store.ts`** — in-memory store with `list` / `subscribe` / add / update / remove per entity.
- **`src/data/scas-mock-data.ts`** — types and mock data (User, AccessCard, Zone, Door, Device, Profile, AccessLog, AuditLog, Schedule).

To integrate your API: implement the same interface (e.g. in `src/api/` or `src/services/`) and swap the store usage to API calls. Keep the types from `scas-mock-data.ts` as your frontend DTOs.
