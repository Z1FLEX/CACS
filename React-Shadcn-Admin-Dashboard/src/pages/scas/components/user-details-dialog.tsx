import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import type { User, AccessCard } from '@/types/scas'
import { subscribeAccessCards, getAccessCards, loadAccessCards, updateUser, updateAccessCard } from '@/services'
import AssignCardDialog from './assign-card-dialog'
import { IconCreditCard, IconTrash, IconPlus } from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export default function UserDetailsDialog({ open, onOpenChange, user }: Props) {
  const [cards, setCards] = useState<AccessCard[]>(() => getAccessCards())
  const [assignCardOpen, setAssignCardOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const unsub = subscribeAccessCards(setCards)
    loadAccessCards().then(() => {})
    return unsub
  }, [])

  const userCard = user?.cardId ? cards.find(c => c.id === user.cardId) : null

  const handleUnassignCard = async () => {
    if (!user || !userCard) return

    try {
      // Update user to remove card assignment
      await updateUser({
        ...user,
        cardId: undefined,
      })

      // Update card to remove user assignment
      await updateAccessCard({
        ...userCard,
        userId: undefined,
        userName: undefined,
      })

      toast({
        title: 'Card unassigned',
        description: `Access card ${userCard.cardNumber} has been unassigned from ${user.name}.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unassign card. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCardAssigned = () => {
    // Refresh data when card is assigned
    loadAccessCards()
  }

  if (!user) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information and access cards
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-start gap-4'>
                  <Avatar className='h-16 w-16'>
                    {user.photo && <AvatarImage src={user.photo} alt={user.name} />}
                    <AvatarFallback className='text-lg'>
                      {user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 space-y-2'>
                    <div>
                      <h3 className='font-semibold text-lg'>{user.name}</h3>
                      <p className='text-muted-foreground'>{user.email}</p>
                    </div>
                    <div className='flex gap-2 flex-wrap'>
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      <p>Created: {user.createdAt}</p>
                      {user.firstName && user.lastName && (
                        <p>Full Name: {user.firstName} {user.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Card Management */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg flex items-center gap-2'>
                    <IconCreditCard className='h-5 w-5' />
                    Access Card Management
                  </CardTitle>
                  {!userCard && (
                    <Button
                      size='sm'
                      onClick={() => setAssignCardOpen(true)}
                      className='gap-2'
                    >
                      <IconPlus size={14} />
                      Assign Card
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {userCard ? (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
                      <div className='space-y-1'>
                        <div className='font-medium font-mono'>{userCard.cardNumber}</div>
                        <div className='text-sm text-muted-foreground'>
                          Status: <Badge variant={userCard.status === 'ACTIVE' ? 'default' : 'secondary'} className='text-xs'>
                            {userCard.status}
                          </Badge>
                        </div>
                        {userCard.issueDate && (
                          <div className='text-sm text-muted-foreground'>
                            Issued: {userCard.issueDate}
                          </div>
                        )}
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleUnassignCard}
                        className='gap-2 text-destructive hover:text-destructive'
                      >
                        <IconTrash size={14} />
                        Unassign
                      </Button>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setAssignCardOpen(true)}
                      >
                        Change Card
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <IconCreditCard className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                    <h4 className='font-medium mb-2'>No Access Card Assigned</h4>
                    <p className='text-sm text-muted-foreground mb-4'>
                      This user does not have an access card assigned. Assign a card to grant physical access.
                    </p>
                    <Button
                      onClick={() => setAssignCardOpen(true)}
                      className='gap-2'
                    >
                      <IconPlus size={16} />
                      Assign Card
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <AssignCardDialog
        open={assignCardOpen}
        onOpenChange={setAssignCardOpen}
        user={user}
        onCardAssigned={handleCardAssigned}
      />
    </>
  )
}
