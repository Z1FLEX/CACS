import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import type { User, Zone } from '@/types/scas'
import { getUsers, subscribeUsers, updateZone } from '@/services'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  zone: Zone | null
}

export default function AssignZoneManagerDialog({ open, onOpenChange, zone }: Props) {
  const [users, setUsers] = useState<User[]>(() => getUsers())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = subscribeUsers(setUsers)
    return unsub
  }, [])

  // Filter users by search term (name or registration number)
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.registrationNumber && user.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAssignManager = async () => {
    if (!zone || !selectedUser) return

    try {
      const updated = {
        ...zone,
        manager: selectedUser.name,
      }
      await updateZone(updated)
      onOpenChange(false)
      setSelectedUser(null)
      setSearchTerm('')
    } catch (error) {
      console.error('Failed to assign manager:', error)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedUser(null)
    setSearchTerm('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Assign Zone Manager</DialogTitle>
          <DialogDescription>
            Search and select a user to manage the zone: {zone?.name}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <Input
            placeholder='Search by name or registration number...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className='max-h-60 overflow-y-auto space-y-2 border rounded-md p-2'>
            {filteredUsers.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-4'>
                No users found
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{user.name}</p>
                      {user.registrationNumber && (
                        <p className='text-sm text-muted-foreground'>
                          Reg: {user.registrationNumber}
                        </p>
                      )}
                      {user.email && (
                        <p className='text-sm text-muted-foreground'>
                          {user.email}
                        </p>
                      )}
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <Badge variant='outline'>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedUser && (
            <div className='p-3 bg-gray-50 rounded-md'>
              <p className='text-sm font-medium'>Selected Manager:</p>
              <p className='text-sm'>{selectedUser.name}</p>
              {selectedUser.registrationNumber && (
                <p className='text-xs text-muted-foreground'>
                  Registration: {selectedUser.registrationNumber}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignManager} 
            disabled={!selectedUser}
          >
            Assign Manager
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
