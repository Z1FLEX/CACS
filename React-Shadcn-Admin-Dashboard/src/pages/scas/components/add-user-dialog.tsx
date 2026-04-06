import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import type { User } from '@/types/scas'
import { addUser, updateUser } from '@/services'

const roles = [
  { label: 'User', value: 'USER' },
  { label: 'Responsable', value: 'RESPONSABLE' },
  { label: 'Admin', value: 'ADMIN' },
]

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['USER', 'RESPONSABLE', 'ADMIN']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  photo: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: User | null
}

export default function AddUserDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (current) {
      form.reset({
        name: current.name,
        email: current.email,
        role: current.role,
        status: current.status,
        photo: current.photo,
      })
    }
  }, [current])

  const onSubmit = async (vals: FormValues) => {
    if (current) {
      const updated: User = {
        ...current,
        name: vals.name,
        email: vals.email,
        role: vals.role as User['role'],
        status: vals.status as User['status'],
        photo: vals.photo || undefined,
      }
      await updateUser(updated)
    } else {
      const newUser: Partial<User> = {
        name: vals.name,
        firstName: vals.name.split(' ')[0],
        lastName: vals.name.split(' ').slice(1).join(' ') || undefined,
        email: vals.email,
        role: vals.role as User['role'],
        status: (vals.status as User['status']) || 'ACTIVE',
        photo: vals.photo || undefined,
      }
      await addUser(newUser)
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>{current ? 'Update user details' : 'Create a new user in the system'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-user' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input placeholder='Jane Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='jane.doe@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <SelectDropdown items={roles} defaultValue={field.value} onValueChange={field.onChange} />
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
                    <SelectDropdown items={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Inactive', value: 'INACTIVE' }]} defaultValue={field.value} onValueChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='photo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='https://...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='scas-add-user'>{current ? 'Update User' : 'Create User'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
