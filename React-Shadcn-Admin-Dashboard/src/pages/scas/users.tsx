import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TableDataWrapper, ColumnConfig } from '@/components/custom/table-data-wrapper'
import { EmptyState } from '@/components/custom/empty-state'
import type { User } from '@/types/scas'
import { subscribeUsers, getUsers, loadUsers, removeUser } from '@/services'
import AddUserDialog from './components/add-user-dialog'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'

const userColumns: ColumnConfig[] = [
  { key: 'photo', label: 'Photo', visible: true },
  { key: 'name', label: 'Name', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'role', label: 'Role', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'cardId', label: 'Card', visible: true },
  { key: 'createdAt', label: 'Created', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => getUsers())
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [error] = useState<string | null>(null) // Placeholder: set second element when API/service fails

  useEffect(() => {
    const unsub = subscribeUsers(setUsers)
    loadUsers().then(() => {})
    return unsub
  }, [])

  const handleAddUser = () => setOpen(true)

  const handleEditUser = (id: string) => {
    const u = users.find(x => x.id === id)
    if (u) {
      setCurrent(u)
      setOpen(true)
    }
  }

  const handleDeleteUser = (id: string) => {
    const u = users.find(x => x.id === id)
    if (u) setDeleteTarget({ id: u.id, name: u.name })
  }

  const confirmDeleteUser = async () => {
    if (deleteTarget) {
      await removeUser(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className='space-y-4'>
      {error && (
        <div className='rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive' role='alert'>
          {error}
        </div>
      )}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Users Management</h2>
          <p className='text-muted-foreground'>Manage system users and their roles</p>
        </div>
        <Button onClick={handleAddUser} className='gap-2'>
          <IconPlus size={16} />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <EmptyState
              title="No users yet"
              description="Add your first user to get started. Users can be assigned roles and access cards."
            />
          ) : (
          <TableDataWrapper
            data={users}
            columns={userColumns}
            itemsPerPage={10}
            searchableFields={['name', 'email', 'role']}
          >
            {({ data, visibleColumns }) => (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.map(col => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((user) => (
                      <TableRow key={user.id}>
                        {visibleColumns.map(col => (
                          <TableCell key={`${user.id}-${col.key}`}>
                            {col.key === 'photo' && (
                              <Avatar className='h-8 w-8'>
                                {user.photo && <AvatarImage src={user.photo} alt={user.name} />}
                                <AvatarFallback>
                                  {user.name
                                    .split(' ')
                                    .map((n: string) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {col.key === 'role' && (
                              <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                                {user.role}
                              </Badge>
                            )}
                            {col.key === 'status' && (
                              <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                {user.status}
                              </Badge>
                            )}
                            {col.key === 'cardId' && (user.cardId || '-')}
                            {col.key === 'actions' && (
                              <div className='flex gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleEditUser(user.id)}
                                >
                                  <IconEdit size={16} />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <IconTrash size={16} />
                                </Button>
                              </div>
                            )}
                            {!['photo', 'role', 'status', 'cardId', 'actions'].includes(col.key) && (
                              <>
                                {col.key === 'name' && <span className='font-medium'>{user.name}</span>}
                                {col.key === 'email' && user.email}
                                {col.key === 'createdAt' && user.createdAt}
                              </>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TableDataWrapper>
          )}
        <AddUserDialog open={open} onOpenChange={(s) => { if (!s) setCurrent(null); setOpen(s) }} current={current} />
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the user &quot;{deleteTarget?.name}&quot; from the system.
              Any associated access cards and access history may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
