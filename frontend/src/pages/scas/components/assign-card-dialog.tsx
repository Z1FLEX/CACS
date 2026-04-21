import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
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
import { useToast } from '@/components/ui/use-toast'
import type { User, AccessCard } from '@/types/scas'
import { subscribeAccessCards, getAccessCards, loadAccessCards, updateUser } from '@/services'
import FindCardDialog from './find-card-dialog'
import { IconSearch, IconLoader } from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onCardAssigned?: () => void
}

interface FormData {
  cardUuid: string
}

export default function AssignCardDialog({ open, onOpenChange, user, onCardAssigned }: Props) {
  const [cards, setCards] = useState<AccessCard[]>(() => getAccessCards())
  const [isAssigning, setIsAssigning] = useState(false)
  const [findCardOpen, setFindCardOpen] = useState(false)
  const [scanStatus, setScanStatus] = useState<'waiting' | 'detected' | 'not_found' | 'assigning'>('waiting')
  const inputRef = useRef<HTMLInputElement>(null)
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const form = useForm<FormData>({
    defaultValues: { cardUuid: '' }
  })

  useEffect(() => {
    const unsub = subscribeAccessCards(setCards)
    loadAccessCards().then(() => {})
    return unsub
  }, [])

  // Auto-focus management
  useEffect(() => {
    if (open) {
      // Focus the input when modal opens
      setTimeout(() => {
        inputRef.current?.focus()
        setScanStatus('waiting')
      }, 100)

      // Set up interval to maintain focus
      focusIntervalRef.current = setInterval(() => {
        if (document.activeElement !== inputRef.current && inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    } else {
      // Clean up interval when modal closes
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current)
        focusIntervalRef.current = null
      }
      form.reset()
      setScanStatus('waiting')
    }

    return () => {
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current)
      }
    }
  }, [open, form])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const cardUuid = form.getValues('cardUuid').trim()
      if (cardUuid) {
        handleAssignCard(cardUuid)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    form.setValue('cardUuid', value)
    
    if (value.trim()) {
      const card = cards.find(c => 
        (c.uuid || c.id) === value.trim()
      )
      if (card) {
        setScanStatus('detected')
      } else {
        setScanStatus('not_found')
      }
    } else {
      setScanStatus('waiting')
    }
  }

  const handleAssignCard = async (cardUuid: string) => {
    if (!user) return

    const card = cards.find(c => 
      (c.uuid || c.id) === cardUuid
    )

    if (!card) {
      setScanStatus('not_found')
      // Show a more user-friendly error message instead of browser alert
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return
    }

    setIsAssigning(true)
    setScanStatus('assigning')

    try {
      // Check if card is already assigned to another user
      if (card.userId && card.userId !== user.id) {
        toast({
          title: 'Card already assigned',
          description: `Card ${card.uuid || card.id} is already assigned to another user.`,
          variant: 'destructive',
        })
        setScanStatus('not_found')
        form.reset()
        inputRef.current?.focus()
        return
      }

      // Check if card is already assigned to this user
      if (card.userId === user.id) {
        toast({
          title: 'Card already assigned',
          description: `Card ${card.uuid || card.id} is already assigned to ${user.name}.`,
          variant: 'destructive',
        })
        setScanStatus('detected')
        form.reset()
        inputRef.current?.focus()
        return
      }

      // Link is stored on the user row (access_card_id); card DTO userId is derived server-side
      await updateUser({ ...user, cardId: card.id })

      toast({
        title: 'Card assigned successfully',
        description: `Card ${card.uuid || card.id} has been assigned to ${user.name}.`,
      })

      onCardAssigned?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error assigning card',
        description: 'Failed to assign card. Please try again.',
        variant: 'destructive',
      })
      setScanStatus('detected')
      inputRef.current?.focus()
    } finally {
      setIsAssigning(false)
    }
  }

  const handleFindCard = () => {
    setFindCardOpen(true)
  }

  const handleCardSelected = (card: AccessCard) => {
    form.setValue('cardUuid', card.uuid || card.id)
    setScanStatus('detected')
    inputRef.current?.focus()
  }

  const getStatusIndicator = () => {
    switch (scanStatus) {
      case 'waiting':
        return (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <div className='w-2 h-2 bg-muted-foreground rounded-full'></div>
            <span className='text-sm'>Waiting for card selection...</span>
          </div>
        )
      case 'detected':
        return (
          <div className='flex items-center gap-2 text-green-600'>
            <div className='w-2 h-2 bg-green-600 rounded-full'></div>
            <span className='text-sm'>Card selected</span>
          </div>
        )
      case 'not_found':
        return (
          <div className='flex items-center gap-2 text-red-600'>
            <div className='w-2 h-2 bg-red-600 rounded-full'></div>
            <span className='text-sm'>Card UUID not found</span>
          </div>
        )
      case 'assigning':
        return (
          <div className='flex items-center gap-2 text-blue-600'>
            <IconLoader className='h-4 w-4 animate-spin' />
            <span className='text-sm'>Assigning...</span>
          </div>
        )
      default:
        return null
    }
  }

  if (!user) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Assign Access Card</DialogTitle>
            <DialogDescription>
              Select a stocked card by UUID to assign it to {user.name}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Status Indicator */}
            <div className='flex justify-center py-2'>
              {getStatusIndicator()}
            </div>

            {/* Card UUID Input */}
            <div className='space-y-2'>
              <label htmlFor='card-uuid-input' className='text-sm font-medium'>
                Card UUID
              </label>
              <Input
                id='card-uuid-input'
                placeholder='Paste card UUID or use Find Card'
                {...form.register('cardUuid')}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isAssigning}
                className='font-mono'
              />
              <p className='text-xs text-muted-foreground'>
                Use a card UUID from the access card inventory, or click Find Card to choose one from stock.
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 pt-2'>
              <Button
                variant='outline'
                onClick={handleFindCard}
                disabled={isAssigning}
                className='gap-2'
              >
                <IconSearch size={16} />
                Find Card
              </Button>
              <Button
                onClick={() => handleAssignCard(form.getValues('cardUuid').trim())}
                disabled={!form.getValues('cardUuid').trim() || isAssigning}
                className='flex-1'
              >
                {isAssigning ? (
                  <>
                    <IconLoader className='h-4 w-4 animate-spin mr-2' />
                    Assigning...
                  </>
                ) : (
                  'Assign Card'
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FindCardDialog
        open={findCardOpen}
        onOpenChange={setFindCardOpen}
        cards={cards}
        onCardSelected={handleCardSelected}
      />
    </>
  )
}
