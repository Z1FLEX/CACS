import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
import type { AccessCard } from '@/types/scas'
import { subscribeAccessCards, getAccessCards, loadAccessCards, removeAccessCard } from '@/services'
import AddCardDialog from './components/add-card-dialog'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'

const accessCardColumns: ColumnConfig[] = [
  { key: 'cardNumber', label: 'Card Number', visible: true },
  { key: 'userName', label: 'Assigned User', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'issueDate', label: 'Issue Date', visible: true },
  { key: 'actions', label: 'Actions', visible: true },
]

export default function AccessCardsPage() {
  const [cards, setCards] = useState<AccessCard[]>(() => getAccessCards())
  

  useEffect(() => {
    const unsub = subscribeAccessCards(setCards)
    loadAccessCards().then(() => {})
    return unsub
  }, [])

  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<AccessCard | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; cardNumber: string } | null>(null)

  const handleEditCard = (id: string) => {
    const c = cards.find(x => x.id === id)
    if (c) {
      setCurrent(c)
      setOpen(true)
    }
  }

  const handleDeleteCard = (id: string) => {
    const c = cards.find(x => x.id === id)
    if (c) setRevokeTarget({ id: c.id, cardNumber: c.cardNumber })
  }

  const confirmRevokeCard = async () => {
    if (revokeTarget) {
      await removeAccessCard(revokeTarget.id)
      setRevokeTarget(null)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Access Cards Management</h2>
          <p className='text-muted-foreground'>Manage physical access cards and their status</p>
        </div>
        <Button onClick={() => setOpen(true)} className='gap-2'>
          <IconPlus size={16} />
          Issue Card
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <EmptyState
              title="No access cards yet"
              description="Issue a card to assign physical access to users. Cards can be linked to users and zones."
            />
          ) : (
          <TableDataWrapper
            data={cards}
            columns={accessCardColumns}
            itemsPerPage={10}
            searchableFields={['cardNumber', 'userName', 'status']}
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
                    {data.map((card) => (
                      <TableRow key={card.id}>
                        {visibleColumns.map(col => (
                          <TableCell key={`${card.id}-${col.key}`}>
                            {col.key === 'status' && (
                              <Badge
                                variant={
                                  card.status === 'ACTIVE'
                                    ? 'default'
                                    : card.status === 'REVOKED'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {card.status}
                              </Badge>
                            )}
                            {col.key === 'cardNumber' && <span className='font-medium'>{card.cardNumber}</span>}
                            {col.key === 'userName' && (card.userName || 'Unassigned')}
                            {col.key === 'actions' && (
                              <div className='flex gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleEditCard(card.id)}
                                >
                                  <IconEdit size={16} />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleDeleteCard(card.id)}
                                >
                                  <IconTrash size={16} />
                                </Button>
                              </div>
                            )}
                            {!['status', 'cardNumber', 'userName', 'actions'].includes(col.key) && (
                              <>
                                {col.key === 'issueDate' && card.issueDate}
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
        </CardContent>
        <AddCardDialog open={open} onOpenChange={(s) => { if (!s) setCurrent(null); setOpen(s) }} current={current} />
      </Card>

      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke access card</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Revoking the card &quot;{revokeTarget?.cardNumber}&quot; will permanently remove it from the system.
              The card holder will lose physical access until a new card is issued.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevokeCard} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Revoke card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
