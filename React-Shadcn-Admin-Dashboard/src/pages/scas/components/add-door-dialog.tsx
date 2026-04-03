import { useEffect } from 'react'
import { z } from 'zod'
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
import { addDoor, updateDoor } from '@/services'

const schema = z.object({
  name: z.string().min(1),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: any | null
  onSuccess?: () => Promise<void> | void
}

export default function AddDoorDialog({ open, onOpenChange, current, onSuccess }: Props) {
  const form = useForm<FormValues>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
    }
  })

  useEffect(() => {
    if (current) {
      form.reset({ name: current.name })
    }
  }, [current])

  const onSubmit = async (vals: FormValues) => {
    if (current) {
      await updateDoor(String(current.id), {
        ...current,
        name: vals.name,
      })
    } else {
      const newDoor = {
        id: String(Date.now()),
        name: vals.name,
      }
      await addDoor(newDoor as any)
    }

    form.reset({
      name: '',
    })
    if (onSuccess) await onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(s) => { 
      form.reset({
        name: '',
      }); 
      onOpenChange(s) 
    }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Door' : 'Add Door'}</DialogTitle>
          <DialogDescription>{current ? 'Update door details' : 'Create a new door'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-door' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Door name</FormLabel>
                <FormControl>
                  <Input placeholder='Main Entrance' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='scas-add-door'>{current ? 'Update Door' : 'Create Door'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
