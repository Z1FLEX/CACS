import { useEffect, useRef, useState } from 'react'
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
import { useToast } from '@/components/ui/use-toast'
import { addAccessCard, getAccessCardEnrollmentStatus, startAccessCardEnrollment, stopAccessCardEnrollment } from '@/services'
import { IconCreditCard, IconLoader } from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddCardDialog({ open, onOpenChange }: Props) {
  const [scannedUid, setScannedUid] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expiresInSeconds, setExpiresInSeconds] = useState<number>()
  const pollingRef = useRef<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false

    const pollEnrollment = async () => {
      try {
        const status = await getAccessCardEnrollmentStatus()
        if (cancelled) return

        setExpiresInSeconds(status.expiresInSeconds)
        if (status.uid) {
          setScannedUid(status.uid)
        }
        if (!status.active && !status.uid) {
          stopPolling()
        }
      } catch {
        if (!cancelled) {
          stopPolling()
        }
      }
    }

    const armEnrollment = async () => {
      setIsStarting(true)
      setScannedUid('')
      try {
        const status = await startAccessCardEnrollment()
        if (cancelled) return
        setExpiresInSeconds(status.expiresInSeconds)
        pollEnrollment()
        pollingRef.current = window.setInterval(pollEnrollment, 1000)
      } catch {
        if (!cancelled) {
          toast({
            title: 'Enrollment mode failed',
            description: 'Unable to arm card enrollment mode. Please try again.',
            variant: 'destructive',
          })
          onOpenChange(false)
        }
      } finally {
        if (!cancelled) {
          setIsStarting(false)
        }
      }
    }

    if (open) {
      armEnrollment()
    } else {
      resetState()
    }

    return () => {
      cancelled = true
      resetState()
    }
  }, [open, onOpenChange, toast])

  const stopPolling = () => {
    if (pollingRef.current !== null) {
      window.clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const resetState = () => {
    stopPolling()
    setScannedUid('')
    setExpiresInSeconds(undefined)
    void stopAccessCardEnrollment()
  }

  const handleCreate = async () => {
    if (!scannedUid) {
      return
    }

    setIsSaving(true)
    try {
      await addAccessCard(scannedUid)
      toast({
        title: 'Card enrolled',
        description: 'The scanned card was added in the inactive state.',
      })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Card enrollment failed',
        description: error?.response?.data?.message || 'Unable to create the card.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(s) => {
        onOpenChange(s)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Access Card</DialogTitle>
          <DialogDescription>
            The reader is armed for 60 seconds. Scan the physical card to capture its UID before creating it in stock.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='rounded-lg border bg-muted/30 p-4'>
            <div className='flex items-center gap-3'>
              {isStarting ? (
                <IconLoader className='h-5 w-5 animate-spin text-primary' />
              ) : (
                <IconCreditCard className='h-5 w-5 text-primary' />
              )}
              <div>
                <p className='font-medium'>
                  {scannedUid ? 'Card captured' : 'Waiting for card scan'}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {scannedUid
                    ? 'Review the captured UID below, then confirm creation.'
                    : `Enrollment mode expires in ${expiresInSeconds ?? 60}s.`}
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <label htmlFor='captured-card-uid' className='text-sm font-medium'>
              Captured Card UID
            </label>
            <Input
              id='captured-card-uid'
              value={scannedUid}
              placeholder='Scan a physical card to populate this field'
              readOnly
              className='font-mono'
            />
            <p className='text-xs text-muted-foreground'>
              The raw UID is only kept in memory long enough to create the card. The backend stores a SHA-256 hash and saves the new card as inactive.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!scannedUid || isStarting || isSaving}>
            {isSaving ? 'Creating...' : 'Create Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
