import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDateTime } from '@/lib/date-time'
import type { AccessCard } from '@/types/scas'
import { IconSearch, IconCreditCard } from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  cards: AccessCard[]
  onCardSelected: (card: AccessCard) => void
}

export default function FindCardDialog({ open, onOpenChange, cards, onCardSelected }: Props) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards

    const query = searchQuery.toLowerCase()
    return cards.filter(card =>
      (card.uuid || card.id).toLowerCase().includes(query) ||
      card.userName?.toLowerCase().includes(query) ||
      card.status.toLowerCase().includes(query)
    )
  }, [cards, searchQuery])

  const handleCardClick = (card: AccessCard) => {
    onCardSelected(card)
    onOpenChange(false)
    setSearchQuery('')
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearchQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Find Access Card</DialogTitle>
          <DialogDescription>
            Search for an existing access card by UUID or assigned user
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Search Input */}
          <div className='relative'>
            <IconSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by UUID or user name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className='max-h-80 overflow-y-auto space-y-2'>
            {filteredCards.length === 0 ? (
              <div className='text-center py-8'>
                <IconCreditCard className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                <h4 className='font-medium mb-2'>
                  {searchQuery ? 'No cards found' : 'No cards available'}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {searchQuery 
                    ? 'Try adjusting your search terms or create new cards in the Access Cards page.'
                    : 'Create cards in the Access Cards page first.'
                  }
                </p>
              </div>
            ) : (
              <>
                {searchQuery && (
                  <p className='text-sm text-muted-foreground px-2'>
                    Found {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
                  </p>
                )}
                {filteredCards.map((card) => (
                  <Card
                    key={card.id}
                    className='cursor-pointer hover:bg-muted/50 transition-colors'
                    onClick={() => handleCardClick(card)}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='space-y-1'>
                          <div className='font-medium font-mono text-sm'>
                            {card.uuid || card.id}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {card.userName ? `Assigned to: ${card.userName}` : 'Unassigned'}
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge 
                              variant={
                                card.status === 'ACTIVE'
                                  ? 'default'
                                  : card.status === 'REVOKED'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className='text-xs'
                            >
                              {card.status}
                            </Badge>
                            {card.createdAt && (
                              <span className='text-xs text-muted-foreground'>
                                Created: {formatDateTime(card.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <IconCreditCard className='h-5 w-5 text-muted-foreground' />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>

          {/* Instructions */}
          <div className='text-xs text-muted-foreground bg-muted p-3 rounded'>
            <p className='font-medium mb-1'>Search Tips:</p>
            <ul className='list-disc list-inside space-y-1'>
              <li>Type the card UUID to find a specific card</li>
              <li>Type user name to find cards assigned to that person</li>
              <li>Type "assigned" or "unassigned" to filter by status</li>
              <li>Click on any card to select it</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
