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
import type { Profile } from '@/types/scas'
import { addProfile, updateProfile } from '@/services'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.number().min(0).optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: Profile | null
}

export default function AddProfileDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { permissions: 0 } })


  useEffect(() => {
    if (current) {
      form.reset({ name: current.name, description: current.description, permissions: current.permissions })
    }
  }, [current])

  const onSubmit = async (vals: FormValues) => {
    if (current) {
      const updated = { ...current, name: vals.name, description: vals.description || '', permissions: vals.permissions || 0 }
      await updateProfile(updated)
    } else {
      const id = String(Date.now())
      const newProfile = { id, name: vals.name, description: vals.description || '', permissions: vals.permissions || 0 }
      await addProfile(newProfile)
    }
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(s) => { form.reset(); onOpenChange(s) }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Profile' : 'Create Profile'}</DialogTitle>
          <DialogDescription>{current ? 'Update access profile' : 'Add a new access profile'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-profile' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Full Access' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='description' render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder='Access to all zones and doors' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='permissions' render={({ field }) => (
              <FormItem>
                <FormLabel>Permissions</FormLabel>
                <FormControl>
                  <Input type='number' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='scas-add-profile'>{current ? 'Update Profile' : 'Create Profile'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
