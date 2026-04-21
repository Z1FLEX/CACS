import { useEffect, useState } from 'react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { addDevice, updateDevice } from '@/services'
import { DeviceType } from '@/types/device'
import type { Zone } from '@/types/scas'
import { IconCheck, IconSelector } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface DeviceDTO {
  id?: number
  serialNumber: string
  modelName: string
  type: 'READER' | 'CONTROLLER' | 'LOCK'
  ip: string
  port: number
  status?: 'ONLINE' | 'OFFLINE'
  zoneId?: number
  relayCount?: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: DeviceDTO | null
  zones: Zone[]
  onSuccess?: () => Promise<void> | void
}

const schema = z.object({
  type: z.nativeEnum(DeviceType),
  serialNumber: z.string().min(1, 'Serial number is required'),
  modelName: z.string().min(1, 'Model name is required'),
  zoneId: z.string().min(1, 'Zone is required'),
  relayCount: z.number().min(1, 'Relay count must be at least 1').max(64, 'Relay count cannot exceed 64'),
  ip: z.string().min(1, 'IP address is required'),
  port: z.number().min(1, 'Port must be at least 1').max(65535, 'Port cannot exceed 65535'),
})

type FormValues = z.infer<typeof schema>

export default function AddDeviceDialog({ open, onOpenChange, current, zones, onSuccess }: Props) {
  const [zonePickerOpen, setZonePickerOpen] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: DeviceType.READER,
      serialNumber: '',
      modelName: '',
      zoneId: '',
      relayCount: 1,
      ip: '',
      port: 8080,
    },
  })

  useEffect(() => {
    if (current) {
      form.reset({
        type: (current.type || 'READER') as DeviceType,
        serialNumber: current.serialNumber,
        modelName: current.modelName,
        zoneId: current.zoneId != null ? String(current.zoneId) : '',
        relayCount: current.relayCount ?? 1,
        ip: current.ip,
        port: current.port,
      })
    } else {
      form.reset({
        type: DeviceType.READER,
        serialNumber: '',
        modelName: '',
        zoneId: '',
        relayCount: 1,
        ip: '',
        port: 8080,
      })
    }
  }, [current, form])

  const selectedZone = zones.find((zone) => zone.id === form.watch('zoneId'))

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        type: values.type,
        serialNumber: values.serialNumber,
        modelName: values.modelName,
        zoneId: Number(values.zoneId),
        relayCount: values.relayCount,
        ip: values.ip,
        port: values.port,
      }

      if (current?.id != null) {
        await updateDevice(String(current.id), payload)
      } else {
        await addDevice(payload)
      }

      if (onSuccess) await onSuccess()
      onOpenChange(false)
    } catch {
      form.setError('root', { message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { form.reset(); onOpenChange(isOpen) }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Device' : 'Create Device'}</DialogTitle>
          <DialogDescription>
            {current ? 'Update device details and zone placement' : 'Create a device anchored to a zone and define its relay capacity'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-device' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
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
              )}
            />

            <FormField
              control={form.control}
              name='serialNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder='SN001' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='modelName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Name</FormLabel>
                  <FormControl>
                    <Input placeholder='AX-2000' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='zoneId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone</FormLabel>
                  <Popover open={zonePickerOpen} onOpenChange={setZonePickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type='button'
                          variant='outline'
                          role='combobox'
                          className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                        >
                          {selectedZone ? selectedZone.name : 'Select a zone'}
                          <IconSelector size={16} className='ml-2 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
                      <Command>
                        <CommandInput placeholder='Search zones...' />
                        <CommandList>
                          <CommandEmpty>No zones found.</CommandEmpty>
                          {zones.map((zone) => (
                            <CommandItem
                              key={zone.id}
                              value={`${zone.name} ${zone.id}`}
                              onSelect={() => {
                                field.onChange(zone.id)
                                setZonePickerOpen(false)
                              }}
                            >
                              <IconCheck
                                size={16}
                                className={cn('mr-2', zone.id === field.value ? 'opacity-100' : 'opacity-0')}
                              />
                              {zone.name}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='relayCount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relay Count</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={1}
                      max={64}
                      placeholder='4'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ip'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input placeholder='192.168.1.100' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='port'
              render={({ field }) => (
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
              )}
            />
          </form>
          {form.formState.errors.root && (
            <p className='text-sm text-destructive'>
              {form.formState.errors.root.message}
            </p>
          )}
        </Form>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='scas-add-device' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (current ? 'Updating…' : 'Creating…') : (current ? 'Update Device' : 'Create Device')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
