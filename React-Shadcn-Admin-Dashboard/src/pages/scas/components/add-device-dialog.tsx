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
import { SelectDropdown } from '@/components/select-dropdown'
import { addDevice, updateDevice } from '@/services'

const schema = z.object({
  type: z.enum(['reader', 'controller', 'lock']),
  serialNumber: z.string().min(1),
  modelName: z.string().min(1),
  ip: z.string().min(1),
  port: z.number().min(1).max(65535),
})
type FormValues = z.infer<typeof schema>

export default function AddDeviceDialog({ open, onOpenChange, current }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'reader', port: 8080 },
  })

  useEffect(() => {
    if (current) {
      form.reset({
        type: (current.type || 'READER').toLowerCase(),
        serialNumber: current.serialNumber,
        modelName: current.modelName,
        ip: current.ip,
        port: current.port,
      })
    }
  }, [current, form])

  const onSubmit = async (vals: FormValues) => {
    try {
      if (current) {
        const updated = {
          ...current,
          type: vals.type.toUpperCase(), // ✅ ALWAYS uppercase
          serialNumber: vals.serialNumber,
          modelName: vals.modelName,
          ip: vals.ip,
          port: vals.port,
        }

        await updateDevice(updated)
      } else {
        const newDevice = {
          type: vals.type.toUpperCase(), // ✅ matches backend enum
          serialNumber: vals.serialNumber,
          modelName: vals.modelName,
          status: 'ONLINE',
          ip: vals.ip,
          port: vals.port,
        }

        await addDevice(newDevice as any)
      }

      form.reset()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to save device:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(s) => { form.reset(); onOpenChange(s) }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Device' : 'Add Device'}</DialogTitle>
          <DialogDescription>{current ? 'Update device details' : 'Create a new device'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-device' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Device name</FormLabel>
                <FormControl>
                  <Input placeholder='Entrance Reader' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='type' render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <SelectDropdown items={[{ label: 'Reader', value: 'reader' }, { label: 'Controller', value: 'controller' }, { label: 'Lock', value: 'lock' }]} defaultValue={field.value} onValueChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='serialNumber' render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder='SN001' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='modelName' render={({ field }) => (
              <FormItem>
                <FormLabel>Model Name</FormLabel>
                <FormControl>
                  <Input placeholder='AX-2000' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='ip' render={({ field }) => (
              <FormItem>
                <FormLabel>IP Address</FormLabel>
                <FormControl>
                  <Input placeholder='192.168.1.100' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='port' render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input type='number' placeholder='8080' {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='scas-add-device'>{current ? 'Update Device' : 'Create Device'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
