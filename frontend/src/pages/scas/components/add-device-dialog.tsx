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
import { DeviceType } from '@/types/device'

// Backend Device DTO type
interface DeviceDTO {
  id?: number
  serialNumber: string
  modelName: string
  type: 'READER' | 'CONTROLLER' | 'LOCK'
  ip: string
  port: number
  status?: 'ONLINE' | 'OFFLINE'
  doorIds?: number[]
}

// Props for the dialog
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: DeviceDTO | null
  onSuccess?: () => Promise<void> | void
}

// Zod schema for form validation
const schema = z.object({
  type: z.nativeEnum(DeviceType),
  serialNumber: z.string().min(1, 'Serial number is required'),
  modelName: z.string().min(1, 'Model name is required'),
  ip: z.string().min(1, 'IP address is required'),
  port: z.number().min(1, 'Port must be at least 1').max(65535, 'Port cannot exceed 65535'),
})
type FormValues = z.infer<typeof schema>

export default function AddDeviceDialog({ open, onOpenChange, current, onSuccess }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: DeviceType.READER, port: 8080 },
  })

  // Reset form when editing an existing device
  useEffect(() => {
    if (current) {
      form.reset({
        type: (current.type || 'READER') as DeviceType,
        serialNumber: current.serialNumber,
        modelName: current.modelName,
        ip: current.ip,
        port: current.port,
      })
    } else {
      form.reset({ type: DeviceType.READER, port: 8080, serialNumber: '', modelName: '', ip: '' })
    }
  }, [current, form])

  // Form submission
const onSubmit = async (values: FormValues) => {
  try {
    if (current?.id != null) {
      await updateDevice(String(current.id), {
        type:         values.type,
        serialNumber: values.serialNumber,
        modelName:    values.modelName,
        ip:           values.ip,
        port:         values.port,
      })
    } else {
      await addDevice({
        type:         values.type,
        serialNumber: values.serialNumber,
        modelName:    values.modelName,
        ip:           values.ip,
        port:         values.port,
        doorIds:      [],
      })
    }
    if (onSuccess) await onSuccess()
    onOpenChange(false)
  } catch (error: unknown) {
    // Try to surface backend field errors into the form
    if (error instanceof Response) {
      try {
        const body = await error.json()
        if (body?.fields) {
          Object.entries(body.fields).forEach(([field, message]) => {
            form.setError(field as keyof FormValues, { message: message as string })
          })
          return
        }
      } catch { /* json parse failed */ }
    }
    form.setError('root', { message: 'Something went wrong. Please try again.' })
  }
}

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { form.reset(); onOpenChange(isOpen) }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Device' : 'Add Device'}</DialogTitle>
          <DialogDescription>{current ? 'Update device details' : 'Create a new device'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-device' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField control={form.control} name='type' render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <SelectDropdown
                    items={[
                      { label: 'Reader', value: DeviceType.READER },
                      { label: 'Controller', value: DeviceType.CONTROLLER },
                      { label: 'Lock', value: DeviceType.LOCK },
                    ]}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  />
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
                  <Input
                    type='number'
                    placeholder='8080'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </form>
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="scas-add-device" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (current ? 'Updating…' : 'Creating…') : (current ? 'Update Device' : 'Create Device')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
// changed