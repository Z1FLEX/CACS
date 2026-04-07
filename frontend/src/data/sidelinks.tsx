import { 
  IconLayoutDashboard, 
  IconUsers, 
  IconLock, 
  IconDoor, 
  IconClipboard,
  IconClock,
  IconLogs,
  IconShieldExclamation,
  IconSettings,
  IconActivity
} from "@tabler/icons-react"

export interface NavLink {
  title: string
  label?: string
  href: string
  icon: JSX.Element
}

export type ScasRole = 'ADMIN' | 'RESPONSABLE' | 'USER'

export interface SideLink extends NavLink {
  sub?: NavLink[]
  /** If set, only these roles see the link. Omit for Dashboard/Settings (all roles). */
  roleRestriction?: ScasRole | ScasRole[]
}

export const sidelinks: SideLink[] = [
  {
    title: 'Dashboard',
    label: '',
    href: '/scas/dashboard',
    icon: <IconLayoutDashboard size={18} />,
  },
  {
    title: 'Users',
    label: '',
    href: '/scas/users',
    icon: <IconUsers size={18} />,
    roleRestriction: ['ADMIN'],
  },
  {
    title: 'Access Cards',
    label: '',
    href: '/scas/access-cards',
    icon: <IconLock size={18} />,
    roleRestriction: ['ADMIN'],
  },
  {
    title: 'Zones',
    label: '',
    href: '/scas/zones',
    icon: <IconClipboard size={18} />,
    roleRestriction: ['ADMIN', 'RESPONSABLE'],
  },
  {
    title: 'Doors & Devices',
    label: '',
    href: '/scas/doors-devices',
    icon: <IconDoor size={18} />,
    roleRestriction: ['ADMIN', 'RESPONSABLE'],
  },
  {
    title: 'Access Profiles',
    label: '',
    href: '/scas/access-profiles',
    icon: <IconShieldExclamation size={18} />,
    roleRestriction: ['ADMIN', 'RESPONSABLE'],
  },
  {
    title: 'Schedules',
    label: '',
    href: '/scas/schedules',
    icon: <IconClock size={18} />,
    roleRestriction: ['ADMIN', 'RESPONSABLE'],
  },
  {
    title: 'Access Logs',
    label: '',
    href: '/scas/access-logs',
    icon: <IconActivity size={18} />,
    roleRestriction: ['ADMIN', 'RESPONSABLE'],
  },
  {
    title: 'Admin Audit Logs',
    label: '',
    href: '/scas/audit-logs',
    icon: <IconLogs size={18} />,
    roleRestriction: 'ADMIN',
  },
  {
    title: 'Settings',
    label: '',
    href: '/settings',
    icon: <IconSettings size={18} />,
  },
]
