import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { SelectDropdown } from '@/components/select-dropdown'
import type { AccessCard } from '@/types/scas'
import { getAccessCards, addAccessCard, updateAccessCard } from '@/services'
import {
  accessCardCreateSchema,
  accessCardStatusOptions,
  buildNewAccessCardDraft,
  type AccessCardCreateValues,
} from '../lib/access-card-create'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: AccessCard | null
}

export default function AddCardDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<AccessCardCreateValues>({
    resolver: zodResolver(accessCardCreateSchema),
    defaultValues: { status: 'ACTIVE', cardNumber: '' },
  })

  useEffect(() => {
    if (current) {
      form.reset({
        cardNumber: current.cardNumber || (current as any).uid || '',
        status: current.status,
      })
    }
  }, [current, form])

  const onSubmit = async (vals: AccessCardCreateValues) => {
    const existing = getAccessCards().find(c => (c.cardNumber || (c as any).uid) === vals.cardNumber && (!current || c.id !== current.id))
    if (existing) {
      form.setError('cardNumber', { message: 'Card UID already exists' })
      return
    }

    if (current) {
      const updated: AccessCard = {
        ...current,
        cardNumber: vals.cardNumber,
        status: (vals.status as AccessCard['status']) || 'ACTIVE',
      }
      await updateAccessCard(updated)
    } else {
      await addAccessCard(buildNewAccessCardDraft(vals))
    }

    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(s) => {
        form.reset()
        onOpenChange(s)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Access Card' : 'Issue Access Card'}</DialogTitle>
          <DialogDescription>{current ? 'Update card details' : 'Register a new access card in the system'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-card' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='cardNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card UID</FormLabel>
                  <FormControl>
                    <Input placeholder='AC-0001' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <SelectDropdown items={[...accessCardStatusOptions]} defaultValue={field.value} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='scas-add-card'>{current ? 'Update Card' : 'Create Card'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
