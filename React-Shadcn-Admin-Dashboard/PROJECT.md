# Project structure & backend integration

## Route layout

| Kind | Location | In sidebar? |
|------|----------|-------------|
| **SCAS app** | `/`, `/scas/*`, `/settings` | Yes (`src/data/sidelinks.tsx`) |
| **Template / component ref** | `/kanban`, `/product`, `/dashboard`, `/chats`, `/order`, `/calendar`, `/emails`, `/tasks`, `/supports`, `/users` | No |
| **Auth** | `/sign-in`, `/sign-in-2`, `/sign-up`, `/forgot-password`, `/otp` | No (public) |
| **Errors** | `/404`, `/500`, `/503`, `/401` | No |

Template routes are grouped in `src/router.tsx` with a comment block so you can remove or move them later without touching SCAS routes.

---

## Data layer (current → backend)

### Current

- **`src/data/scas-mock-data.ts`**  
  - Exports types: `User`, `AccessCard`, `Zone`, `Door`, `Device`, `Profile`, `AccessLog`, `AuditLog`, `Schedule`.  
  - Exports mock arrays: `mockUsers`, `mockAccessCards`, `mockZones`, `mockDoors`, `mockDevices`, `mockProfiles`, `mockAccessLogs`, `mockAuditLogs`, `mockSchedules`.

- **`src/data/scas-store.ts`**  
  - In-memory stores per entity with: `list()`, `subscribe(cb)`, `push(item)`, `update(item)`, `remove(id)`, `replace(items)`.  
  - Convenience exports: `getUsers`, `subscribeUsers`, `addUser`, `updateUser`, `removeUser`, and the same pattern for access cards, zones, doors, devices, profiles.

### Used by

- **SCAS pages** under `src/pages/scas/` (and `src/pages/scas/components/`) import from `@/data/scas-store` and `@/data/scas-mock-data` (types only in some places).
- **Read-only / static data**: `schedules`, `access-logs`, `audit-logs`, `dashboard`, `system-status` use mocks directly (no store subscription). You can later replace with API fetches.

### Backend swap strategy

1. **Keep types**  
   Use (or re-export) the interfaces from `scas-mock-data.ts` as your API response/request types.

2. **Add API layer**  
   e.g. `src/api/scas.ts` or `src/services/` with functions like `fetchUsers()`, `createUser()`, `updateUser()`, etc., matching the store’s list/add/update/remove semantics.

3. **Replace store usage**  
   - Either: implement an API-backed “store” that keeps the same `get*` / `subscribe*` / `add*` / `update*` / `remove*` API and swap the default export in `scas-store.ts` (or use a feature flag / env to choose mock vs API).  
   - Or: change each page to use the new API module instead of `scas-store` and manage loading/error state in the UI.

4. **Read-only pages**  
   Replace direct mock imports with API calls (e.g. `getAccessLogs()`, `getAuditLogs()`, `getSchedules()`, dashboard stats, system status).

---

## Auth & roles

- **`src/contexts/AuthContext.tsx`** — auth state and login/logout.
- **`src/components/custom/protected-route.tsx`** — wraps the app shell; redirects to sign-in when not authenticated.
- **`src/contexts/RoleContext.tsx`** — role (e.g. ADMIN, RESPONSABLE) for nav and feature visibility.
- **Sidebar** — `sidelinks` can use `roleRestriction: 'ADMIN' | 'RESPONSABLE'` to hide items by role.

When you add a backend, sign-in should return a token and user/role; then set them in `AuthContext` and `RoleContext` so `ProtectedRoute` and sidebar restrictions stay correct.

---

## Quick reference: store API to mirror in API layer

| Entity       | List (get) | Subscribe | Add (create) | Update | Remove |
|-------------|------------|-----------|--------------|--------|--------|
| Users       | `getUsers` | `subscribeUsers` | `addUser` | `updateUser` | `removeUser` |
| Access cards| `getAccessCards` | `subscribeAccessCards` | `addAccessCard` | `updateAccessCard` | `removeAccessCard` |
| Zones       | `getZones` | `subscribeZones` | `addZone` | `updateZone` | `removeZone` |
| Doors       | `getDoors` | `subscribeDoors` | `addDoor` | `updateDoor` | `removeDoor` |
| Devices     | `getDevices` | `subscribeDevices` | `addDevice` | `updateDevice` | `removeDevice` |
| Profiles    | `getProfiles` | `subscribeProfiles` | `addProfile` | `updateProfile` | `removeProfile` |

For subscribe: either keep a small client-side cache and notify on API success, or refactor pages to use one-off fetches + refetch after mutations.
