import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { formatDateTime } from '@/lib/date-time'
import type { AccessCard } from '@/types/scas'
import { subscribeAccessCards, getAccessCards, loadAccessCards, removeAccessCard } from '@/services'
import AddCardDialog from './components/add-card-dialog'
import ImportCardsDialog from './components/import-cards-dialog'
import { IconPlus, IconTrash, IconUpload } from '@tabler/icons-react'

const accessCardColumns: ColumnConfig[] = [
  { key: 'uuid', label: 'UUID', visible: true },
  { key: 'userName', label: 'Belongs To', visible: true },
  { key: 'createdAt', label: 'Created At', visible: true },
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
  const [importOpen, setImportOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; uuid: string } | null>(null)

  const handleDeleteCard = (id: string) => {
    const c = cards.find(x => x.id === id)
    if (c) setRevokeTarget({ id: c.id, uuid: c.uuid || c.id })
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
          <p className='text-muted-foreground'>Manage card inventory by UUID, assignment, and creation date</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => setImportOpen(true)} variant='outline' className='gap-2'>
            <IconUpload size={16} />
            Import
          </Button>
          <Button onClick={() => setOpen(true)} className='gap-2'>
            <IconPlus size={16} />
            Add Card
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <EmptyState
              title="No access cards yet"
              description="Add cards through a live scan, then assign them to users when they are ready to be activated."
            />
          ) : (
          <TableDataWrapper
            data={cards}
            columns={accessCardColumns}
            itemsPerPage={10}
            searchableFields={['uuid', 'userName']}
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
                            {col.key === 'uuid' && <span className='font-medium font-mono text-sm'>{card.uuid || card.id}</span>}
                            {col.key === 'userName' && (card.userName || 'Unassigned')}
                            {col.key === 'actions' && (
                              <div className='flex gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleDeleteCard(card.id)}
                                >
                                  <IconTrash size={16} />
                                </Button>
                              </div>
                            )}
                            {!['uuid', 'userName', 'actions'].includes(col.key) && (
                              <>
                                {col.key === 'createdAt' && formatDateTime(card.createdAt || card.issueDate)}
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
        <AddCardDialog open={open} onOpenChange={setOpen} />
        <ImportCardsDialog open={importOpen} onOpenChange={setImportOpen} />
      </Card>

      <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke access card</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Revoking the card &quot;{revokeTarget?.uuid}&quot; will permanently remove it from the system.
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
