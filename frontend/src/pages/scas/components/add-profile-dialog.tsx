import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconMapPin,
  IconSearch,
} from '@tabler/icons-react'
import { addProfile, getSchedules, getZones, loadSchedules, loadZones, updateProfile } from '@/services'
import type { Profile, Schedule, Zone } from '@/types/scas'

const step1Schema = z.object({
  name: z.string().trim().min(1, 'Profile name is required'),
  scheduleIds: z.array(z.string()).min(1, 'At least one schedule must be assigned'),
})

const step2Schema = z.object({
  zoneIds: z.array(z.string()).min(1, 'At least one zone must be assigned'),
})

type Step = 1 | 2 | 3
type Step1FormValues = z.infer<typeof step1Schema>
type Step2FormValues = z.infer<typeof step2Schema>
type ProfileDraft = Step1FormValues & Step2FormValues

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: Profile | null
}

const emptyDraft: ProfileDraft = {
  name: '',
  scheduleIds: [],
  zoneIds: [],
}

function toIdSet(values: string[]): Set<string> {
  return new Set(values)
}

export default function AddProfileDialog({ open, onOpenChange, current }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('')
  const [profileData, setProfileData] = useState<ProfileDraft>(emptyDraft)

  const step1Form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      scheduleIds: [],
    },
  })

  const step2Form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      zoneIds: [],
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    const loadReferenceData = async () => {
      try {
        await Promise.all([loadSchedules(), loadZones()])
        setSchedules(getSchedules())
        setZones(getZones())
      } catch (error) {
        console.error('Failed to load profile dependencies:', error)
      }
    }

    void loadReferenceData()
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const initialData: ProfileDraft = current
      ? {
          name: current.name ?? '',
          scheduleIds: current.scheduleIds ?? [],
          zoneIds: current.zoneIds ?? [],
        }
      : emptyDraft

    setProfileData(initialData)
    step1Form.reset({
      name: initialData.name,
      scheduleIds: initialData.scheduleIds,
    })
    step2Form.reset({
      zoneIds: initialData.zoneIds,
    })
    setScheduleSearchTerm('')
    setCurrentStep(1)
  }, [open, current, step1Form, step2Form])

  const selectedScheduleIds = step1Form.watch('scheduleIds')
  const selectedZoneIds = step2Form.watch('zoneIds')

  const filteredSchedules = useMemo(() => {
    const searchTerm = scheduleSearchTerm.trim().toLowerCase()
    if (!searchTerm) {
      return schedules
    }

    return schedules.filter((schedule) =>
      schedule.name.toLowerCase().includes(searchTerm)
    )
  }, [scheduleSearchTerm, schedules])

  const selectedSchedules = useMemo(() => {
    const selectedIds = toIdSet(profileData.scheduleIds)
    return schedules.filter((schedule) => selectedIds.has(schedule.id))
  }, [profileData.scheduleIds, schedules])

  const selectedZones = useMemo(() => {
    const selectedIds = toIdSet(profileData.zoneIds)
    return zones.filter((zone) => selectedIds.has(zone.id))
  }, [profileData.zoneIds, zones])

  const handleScheduleToggle = (scheduleId: string, checked: boolean) => {
    const nextIds = checked
      ? Array.from(new Set([...selectedScheduleIds, scheduleId]))
      : selectedScheduleIds.filter((id) => id !== scheduleId)

    step1Form.setValue('scheduleIds', nextIds, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleZoneToggle = (zoneId: string, checked: boolean) => {
    const nextIds = checked
      ? Array.from(new Set([...selectedZoneIds, zoneId]))
      : selectedZoneIds.filter((id) => id !== zoneId)

    step2Form.setValue('zoneIds', nextIds, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleStep1Submit = (values: Step1FormValues) => {
    setProfileData((previous) => ({ ...previous, ...values }))
    setCurrentStep(2)
  }

  const handleStep2Submit = (values: Step2FormValues) => {
    setProfileData((previous) => ({ ...previous, ...values }))
    setCurrentStep(3)
  }

  const handleFinalSubmit = async () => {
    const payload: Profile = {
      ...(current ?? {}),
      id: current?.id ?? String(Date.now()),
      name: profileData.name,
      scheduleIds: profileData.scheduleIds,
      zoneIds: profileData.zoneIds,
      createdAt: current?.createdAt ?? new Date().toISOString(),
    }

    try {
      if (current) {
        await updateProfile(payload)
      } else {
        await addProfile(payload)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCurrentStep(1)
      setProfileData(emptyDraft)
      step1Form.reset({
        name: '',
        scheduleIds: [],
      })
      step2Form.reset({ zoneIds: [] })
      setScheduleSearchTerm('')
    }

    onOpenChange(nextOpen)
  }

  const getZoneTypeColor = (zoneType: string) => {
    const colors: Record<string, string> = {
      White: 'bg-gray-100 text-gray-800',
      Green: 'bg-green-100 text-green-800',
      Blue: 'bg-blue-100 text-blue-800',
      Orange: 'bg-orange-100 text-orange-800',
      Red: 'bg-red-100 text-red-800',
      Black: 'bg-black text-white',
    }

    return colors[zoneType] || 'bg-gray-100 text-gray-800'
  }

  const renderStep1 = () => (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold'>Basic Information</h3>
        <p className='text-sm text-muted-foreground'>
          Enter the profile name and assign one or more schedules.
        </p>
      </div>

      <Form {...step1Form}>
        <form
          onSubmit={step1Form.handleSubmit(handleStep1Submit)}
          className='space-y-5'
        >
          <FormField
            control={step1Form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g., Full Access, After Hours Staff'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={step1Form.control}
            name='scheduleIds'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Schedule</FormLabel>
                <FormControl>
                  <div className='space-y-3'>
                    <div className='relative'>
                      <IconSearch className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='Search schedules...'
                        value={scheduleSearchTerm}
                        onChange={(event) => setScheduleSearchTerm(event.target.value)}
                        className='pl-10'
                      />
                    </div>

                    <div className='rounded-md border'>
                      <div className='max-h-56 space-y-1 overflow-y-auto p-2'>
                        {filteredSchedules.map((schedule) => {
                          const checked = field.value.includes(schedule.id)
                          return (
                            <label
                              key={schedule.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                                checked
                                  ? 'border-blue-200 bg-blue-50'
                                  : 'border-transparent hover:bg-muted/50'
                              }`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) =>
                                  handleScheduleToggle(schedule.id, Boolean(value))
                                }
                              />
                              <div className='min-w-0 flex-1'>
                                <div className='font-medium'>{schedule.name}</div>
                                <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                                  <IconClock size={12} />
                                  {schedule.scheduleDays?.length ?? 0} configured day
                                  {(schedule.scheduleDays?.length ?? 0) === 1 ? '' : 's'}
                                </div>
                              </div>
                            </label>
                          )
                        })}

                        {schedules.length === 0 && (
                          <div className='rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground'>
                            No schedules available. Create at least one schedule first.
                          </div>
                        )}

                        {schedules.length > 0 && filteredSchedules.length === 0 && (
                          <div className='rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground'>
                            No schedules found matching "{scheduleSearchTerm}".
                          </div>
                        )}
                      </div>
                    </div>

                    {field.value.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {field.value.map((scheduleId) => {
                          const schedule = schedules.find((item) => item.id === scheduleId)
                          if (!schedule) {
                            return null
                          }

                          return (
                            <Badge key={schedule.id} variant='secondary'>
                              {schedule.name}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end'>
            <Button type='submit'>
              Next Step
              <IconArrowRight size={16} className='ml-2' />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )

  const renderStep2 = () => {
    const selectedIds = toIdSet(selectedZoneIds)
    const availableZones = zones.filter((zone) => !selectedIds.has(zone.id))
    const assignedZones = zones.filter((zone) => selectedIds.has(zone.id))

    return (
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold'>Zone Assignment</h3>
          <p className='text-sm text-muted-foreground'>
            Select one or more zones that this profile should be able to access.
          </p>
        </div>

        <Form {...step2Form}>
          <form
            onSubmit={step2Form.handleSubmit(handleStep2Submit)}
            className='space-y-6'
          >
            <FormField
              control={step2Form.control}
              name='zoneIds'
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className='grid gap-6 md:grid-cols-2'>
                      <Card>
                        <CardHeader>
                          <CardTitle className='text-base'>Available Zones</CardTitle>
                        </CardHeader>
                        <CardContent className='max-h-72 space-y-2 overflow-y-auto'>
                          {availableZones.length === 0 ? (
                            <p className='text-sm text-muted-foreground'>
                              All available zones are already assigned.
                            </p>
                          ) : (
                            availableZones.map((zone) => (
                              <label
                                key={zone.id}
                                className='flex cursor-pointer items-start gap-3 rounded border p-3 transition hover:bg-muted/50'
                              >
                                <Checkbox
                                  checked={false}
                                  onCheckedChange={(value) =>
                                    handleZoneToggle(zone.id, Boolean(value))
                                  }
                                />
                                <div className='min-w-0 flex-1'>
                                  <div className='font-medium'>{zone.name}</div>
                                  <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
                                    <IconMapPin size={12} />
                                    <span>{zone.location || 'No location specified'}</span>
                                    {zone.zoneType && (
                                      <Badge
                                        className={`text-xs ${getZoneTypeColor(
                                          zone.zoneType.name || ''
                                        )}`}
                                      >
                                        {zone.zoneType.name} (Lvl {zone.zoneType.level})
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </label>
                            ))
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className='text-base'>Assigned Zones</CardTitle>
                        </CardHeader>
                        <CardContent className='max-h-72 space-y-2 overflow-y-auto'>
                          {assignedZones.length === 0 ? (
                            <p className='text-sm text-muted-foreground'>
                              No zones assigned yet.
                            </p>
                          ) : (
                            assignedZones.map((zone) => (
                              <label
                                key={zone.id}
                                className='flex cursor-pointer items-start gap-3 rounded border border-blue-200 bg-blue-50 p-3'
                              >
                                <Checkbox
                                  checked
                                  onCheckedChange={(value) =>
                                    handleZoneToggle(zone.id, Boolean(value))
                                  }
                                />
                                <div className='min-w-0 flex-1'>
                                  <div className='font-medium'>{zone.name}</div>
                                  <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
                                    <IconMapPin size={12} />
                                    <span>{zone.location || 'No location specified'}</span>
                                    {zone.zoneType && (
                                      <Badge
                                        className={`text-xs ${getZoneTypeColor(
                                          zone.zoneType.name || ''
                                        )}`}
                                      >
                                        {zone.zoneType.name} (Lvl {zone.zoneType.level})
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </label>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-between'>
              <Button type='button' variant='outline' onClick={() => setCurrentStep(1)}>
                <IconArrowLeft size={16} className='mr-2' />
                Previous
              </Button>
              <Button type='submit'>
                Review Profile
                <IconArrowRight size={16} className='ml-2' />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    )
  }

  const renderStep3 = () => (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-semibold'>Profile Summary</h3>
        <p className='text-sm text-muted-foreground'>
          Review the profile details before saving.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconCheck className='text-green-600' size={20} />
            {profileData.name}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h4 className='mb-2 font-medium'>
              Schedules ({selectedSchedules.length})
            </h4>
            <div className='space-y-2'>
              {selectedSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className='flex items-center gap-2 rounded bg-gray-50 p-2 text-sm'
                >
                  <IconClock size={16} />
                  <div>
                    <div className='font-medium'>{schedule.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {schedule.scheduleDays?.length ?? 0} configured day
                      {(schedule.scheduleDays?.length ?? 0) === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className='mb-2 font-medium'>Zone Access ({selectedZones.length})</h4>
            <div className='space-y-2'>
              {selectedZones.map((zone) => (
                <div
                  key={zone.id}
                  className='flex items-center justify-between rounded bg-gray-50 p-2'
                >
                  <div>
                    <div className='text-sm font-medium'>{zone.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {zone.location || 'No location specified'}
                    </div>
                  </div>
                  {zone.zoneType && (
                    <Badge
                      className={`text-xs ${getZoneTypeColor(zone.zoneType.name || '')}`}
                    >
                      {zone.zoneType.name}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-between'>
        <Button type='button' variant='outline' onClick={() => setCurrentStep(2)}>
          <IconArrowLeft size={16} className='mr-2' />
          Previous
        </Button>
        <Button onClick={handleFinalSubmit}>
          <IconCheck size={16} className='mr-2' />
          {current ? 'Update Profile' : 'Create Profile'}
        </Button>
      </div>
    </div>
  )

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return current ? 'Edit Profile - Step 1: Basic Info' : 'Create Profile - Step 1: Basic Info'
      case 2:
        return current ? 'Edit Profile - Step 2: Zone Assignment' : 'Create Profile - Step 2: Zone Assignment'
      case 3:
        return current ? 'Edit Profile - Step 3: Review & Save' : 'Create Profile - Step 3: Review & Save'
      default:
        return current ? 'Edit Profile' : 'Create Profile'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Enter profile name and assign schedules'
      case 2:
        return 'Assign zones to this profile'
      case 3:
        return 'Review profile details before saving'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        <div className='flex items-center justify-center space-x-2 py-4'>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            1
          </div>
          <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            2
          </div>
          <div className={`h-1 w-12 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            3
          </div>
        </div>

        <div className='py-4'>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
