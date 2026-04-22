import { useEffect, useMemo, useRef, useState } from 'react'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { SelectDropdown } from '@/components/select-dropdown'
import { addDoor, updateDoor } from '@/services'
import type { Device, Door, Zone } from '@/types/scas'
import type { DoorCreateDTO, DoorUpdateDTO } from '@/types/door'
import { IconCheck, IconSelector } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'Door name is required'),
  zoneId: z.string().min(1, 'Zone is required'),
  deviceId: z.string().optional(),
  relayIndex: z.string().optional(),
  location: z.string().optional(),
}).superRefine((value, ctx) => {
  if (value.deviceId && !value.relayIndex) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['relayIndex'],
      message: 'Relay index is required when a device is selected',
    })
  }
  if (!value.deviceId && value.relayIndex) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['deviceId'],
      message: 'Select a device before choosing a relay',
    })
  }
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: Door | null
  zones: Zone[]
  devices: Device[]
  onSuccess?: () => Promise<void> | void
}

export default function AddDoorDialog({ open, onOpenChange, current, zones, devices, onSuccess }: Props) {
  const [zonePickerOpen, setZonePickerOpen] = useState(false)
  const [devicePickerOpen, setDevicePickerOpen] = useState(false)
  const zoneSearchInputRef = useRef<HTMLInputElement>(null)
  const deviceSearchInputRef = useRef<HTMLInputElement>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      zoneId: '',
      deviceId: '',
      relayIndex: '',
      location: '',
    },
  })

  const selectedZoneId = form.watch('zoneId')
  const selectedDeviceId = form.watch('deviceId')

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId)
  const filteredDevices = useMemo(() => {
    if (!selectedZoneId) {
      return []
    }
    return devices.filter((device) => device.zoneId === selectedZoneId)
  }, [devices, selectedZoneId])

  const selectedDevice = filteredDevices.find((device) => device.id === selectedDeviceId)
  const relayOptions = useMemo(() => {
    if (!selectedDevice) {
      return []
    }

    const available = new Set(selectedDevice.availableRelayIndices || [])
    if (current?.deviceId === selectedDevice.id && current.relayIndex != null) {
      available.add(String(current.relayIndex))
    }

    return Array.from(available)
      .sort((a, b) => Number(a) - Number(b))
      .map((value) => ({ label: `Relay ${value}`, value }))
  }, [current?.deviceId, current?.relayIndex, selectedDevice])

  useEffect(() => {
    if (current) {
      form.reset({
        name: current.name,
        zoneId: current.zoneId,
        deviceId: current.deviceId || '',
        relayIndex: current.relayIndex != null ? String(current.relayIndex) : '',
        location: current.location || '',
      })
    } else {
      form.reset({
        name: '',
        zoneId: '',
        deviceId: '',
        relayIndex: '',
        location: '',
      })
    }
  }, [current, form])

  useEffect(() => {
    if (!selectedZoneId) {
      form.setValue('deviceId', '')
      form.setValue('relayIndex', '')
      return
    }

    const currentDeviceId = form.getValues('deviceId')
    if (currentDeviceId && !filteredDevices.some((device) => device.id === currentDeviceId)) {
      form.setValue('deviceId', '')
      form.setValue('relayIndex', '')
    }
  }, [filteredDevices, form, selectedZoneId])

  useEffect(() => {
    const relayIndex = form.getValues('relayIndex')
    if (relayIndex && !relayOptions.some((option) => option.value === relayIndex)) {
      form.setValue('relayIndex', '')
    }
  }, [form, relayOptions])

  useEffect(() => {
    if (!zonePickerOpen) {
      return
    }

    const timer = window.setTimeout(() => {
      zoneSearchInputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [zonePickerOpen])

  useEffect(() => {
    if (!devicePickerOpen) {
      return
    }

    const timer = window.setTimeout(() => {
      deviceSearchInputRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [devicePickerOpen])

  const onSubmit = async (values: FormValues) => {
    const payload: DoorCreateDTO | DoorUpdateDTO = {
      name: values.name,
      zoneId: Number(values.zoneId),
      location: values.location || '',
      deviceId: values.deviceId ? Number(values.deviceId) : undefined,
      relayIndex: values.relayIndex ? Number(values.relayIndex) : undefined,
    }

    if (current) {
      await updateDoor(String(current.id), payload)
    } else {
      await addDoor(payload)
    }

    if (onSuccess) await onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { form.reset(); onOpenChange(isOpen) }}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{current ? 'Edit Door' : 'Create Door'}</DialogTitle>
          <DialogDescription>
            Define the door identity and zone first, then optionally link it to a device relay in the same flow.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='scas-add-door' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Door Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Main Entrance' {...field} />
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
                  <Popover modal open={zonePickerOpen} onOpenChange={setZonePickerOpen}>
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
                    <PopoverContent
                      className='w-[var(--radix-popover-trigger-width)] p-0'
                      align='start'
                      onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                      <Command>
                        <CommandInput ref={zoneSearchInputRef} placeholder='Search zones...' />
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
                              <IconCheck size={16} className={cn('mr-2', zone.id === field.value ? 'opacity-100' : 'opacity-0')} />
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
              name='deviceId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device</FormLabel>
                  <Popover modal open={devicePickerOpen} onOpenChange={setDevicePickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type='button'
                          variant='outline'
                          role='combobox'
                          disabled={!selectedZoneId}
                          className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                        >
                          {selectedDevice ? selectedDevice.name : selectedZoneId ? 'Select a device' : 'Select a zone first'}
                          <IconSelector size={16} className='ml-2 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-[var(--radix-popover-trigger-width)] p-0'
                      align='start'
                      onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                      <Command>
                        <CommandInput ref={deviceSearchInputRef} placeholder='Search devices...' />
                        <CommandList>
                          <CommandEmpty>No devices available in this zone.</CommandEmpty>
                          <CommandItem
                            value='unwired'
                            onSelect={() => {
                              field.onChange('')
                              form.setValue('relayIndex', '')
                              setDevicePickerOpen(false)
                            }}
                          >
                            Leave unwired for now
                          </CommandItem>
                          {filteredDevices.map((device) => (
                            <CommandItem
                              key={device.id}
                              value={`${device.name} ${device.zoneName} ${device.id}`}
                              onSelect={() => {
                                field.onChange(device.id)
                                form.setValue('relayIndex', '')
                                setDevicePickerOpen(false)
                              }}
                            >
                              <IconCheck size={16} className={cn('mr-2', device.id === field.value ? 'opacity-100' : 'opacity-0')} />
                              {device.name}
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

            {selectedDevice && (
              <FormField
                control={form.control}
                name='relayIndex'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relay Index</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        items={relayOptions}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select a relay'
                        isControlled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder='North corridor' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form='scas-add-door'>
            {current ? 'Update Door' : 'Create Door'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
