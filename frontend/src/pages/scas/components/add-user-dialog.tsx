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
import type { User } from '@/types/scas'
import { addUser, updateUser } from '@/services'
import {
  buildNewUserDraft,
  userCreateSchema,
  userRoleOptions,
  userStatusOptions,
  type UserCreateValues,
} from '../lib/user-create'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: User | null
}

export default function AddUserDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<UserCreateValues>({ resolver: zodResolver(userCreateSchema) })

  useEffect(() => {
    if (current) {
      form.reset({
        name: current.name,
        email: current.email,
        role: current.role,
        status: current.status,
      })
    }
  }, [current])

  const onSubmit = async (vals: UserCreateValues) => {
    if (current) {
      const updated: User = {
        ...current,
        name: vals.name,
        email: vals.email,
        role: vals.role as User['role'],
        status: vals.status as User['status'],
      }
      await updateUser(updated)
    } else {
      await addUser(buildNewUserDraft(vals))
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
                    <SelectDropdown items={[...userRoleOptions]} defaultValue={field.value} onValueChange={field.onChange} />
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
                    <SelectDropdown items={[...userStatusOptions]} defaultValue={field.value} onValueChange={field.onChange} />
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
