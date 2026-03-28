import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock, IconMapPin } from '@tabler/icons-react'
import type { Profile, Schedule, Zone } from '@/types/scas'
import { addProfile, updateProfile, loadSchedules, loadZones, getSchedules, getZones } from '@/services'

const step1Schema = z.object({
  name: z.string().min(1, 'Profile name is required'),
  scheduleId: z.string().optional(),
})

const step2Schema = z.object({
  zoneIds: z.array(z.string()).min(1, 'At least one zone must be assigned'),
})

type Step1FormValues = z.infer<typeof step1Schema>
type Step2FormValues = z.infer<typeof step2Schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: Profile | null
}

type Step = 1 | 2 | 3

export default function AddProfileDialog({ open, onOpenChange, current }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([])
  const [profileData, setProfileData] = useState<Step1FormValues & Step2FormValues>({
    name: '',
    scheduleId: '',
    zoneIds: [],
  })

  const step1Form = useForm<Step1FormValues>({ 
    resolver: zodResolver(step1Schema), 
    defaultValues: { name: '', scheduleId: '' }
  })

  const step2Form = useForm<Step2FormValues>({ 
    resolver: zodResolver(step2Schema), 
    defaultValues: { zoneIds: [] }
  })

  useEffect(() => {
    if (open) {
      // Load schedules and zones
      const loadData = async () => {
        try {
          await Promise.all([
            loadSchedules(),
            loadZones()
          ])
          setSchedules(getSchedules())
          setZones(getZones())
        } catch (error) {
          console.error('Failed to load schedules and zones:', error)
        }
      }
      
      loadData()
      
      if (current) {
        const initialData = {
          name: current.name || '',
          scheduleId: current.scheduleId || '',
          zoneIds: current.zoneIds || [],
        }
        setProfileData(initialData)
        step1Form.reset({ name: initialData.name, scheduleId: initialData.scheduleId })
        setSelectedZoneIds(initialData.zoneIds)
        step2Form.setValue('zoneIds', initialData.zoneIds)
      } else {
        // Reset for new profile
        setProfileData({ name: '', scheduleId: '', zoneIds: [] })
        step1Form.reset({ name: '', scheduleId: '' })
        setSelectedZoneIds([])
        step2Form.setValue('zoneIds', [])
        setCurrentStep(1)
      }
    }
  }, [open, current])

  const handleStep1Submit = (values: Step1FormValues) => {
    setProfileData(prev => ({ ...prev, ...values }))
    setCurrentStep(2)
  }

  const handleStep2Submit = () => {
    const values = { zoneIds: selectedZoneIds }
    step2Form.setValue('zoneIds', values.zoneIds)
    setProfileData(prev => ({ ...prev, ...values }))
    setCurrentStep(3)
  }

  const handleZoneToggle = (zoneId: string, checked: boolean) => {
    if (checked) {
      setSelectedZoneIds(prev => [...prev, zoneId])
    } else {
      setSelectedZoneIds(prev => prev.filter(id => id !== zoneId))
    }
  }

  const handleFinalSubmit = async () => {
    try {
      const profilePayload = {
        name: profileData.name,
        scheduleId: profileData.scheduleId ? parseInt(profileData.scheduleId) : undefined,
        zoneIds: profileData.zoneIds.map(id => parseInt(id)),
      }

      if (current) {
        const updated = { ...current, ...profilePayload }
        await updateProfile(updated)
      } else {
        await addProfile(profilePayload as Profile)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const resetDialog = () => {
    setCurrentStep(1)
    step1Form.reset()
    step2Form.reset()
    setSelectedZoneIds([])
    setProfileData({ name: '', scheduleId: '', zoneIds: [] })
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      resetDialog()
    }
    onOpenChange(open)
  }

  const getZoneTypeColor = (zoneType: string) => {
    const colors: Record<string, string> = {
      'White': 'bg-gray-100 text-gray-800',
      'Green': 'bg-green-100 text-green-800',
      'Blue': 'bg-blue-100 text-blue-800',
      'Orange': 'bg-orange-100 text-orange-800',
      'Red': 'bg-red-100 text-red-800',
      'Black': 'bg-black text-white',
    }
    return colors[zoneType] || 'bg-gray-100 text-gray-800'
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">Enter profile name and select a schedule</p>
      </div>
      
      <Form {...step1Form}>
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
          <FormField control={step1Form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Full Access, After Hours Staff" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={step1Form.control} name="scheduleId" render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule (Optional)</FormLabel>
              <FormControl>
                <select 
                  {...field} 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a schedule...</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-end">
            <Button type="submit">
              Next Step
              <IconArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )

  const renderStep2 = () => {
    const availableZones = zones.filter(zone => !selectedZoneIds.includes(zone.id))
    const assignedZones = zones.filter(zone => selectedZoneIds.includes(zone.id))

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Zone Assignment</h3>
          <p className="text-sm text-muted-foreground">Select zones that this profile should have access to</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Available Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Zones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {availableZones.length === 0 ? (
                <p className="text-sm text-muted-foreground">All zones assigned</p>
              ) : (
                availableZones.map((zone) => (
                  <div key={zone.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      id={`available-${zone.id}`}
                      checked={false}
                      onCheckedChange={(checked) => handleZoneToggle(zone.id, checked as boolean)}
                    />
                    <label 
                      htmlFor={`available-${zone.id}`} 
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <div className="font-medium">{zone.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconMapPin size={12} />
                        {zone.location}
                        {zone.zoneType && (
                          <Badge className={`text-xs ${getZoneTypeColor(zone.zoneType.name || '')}`}>
                            {zone.zoneType.name} (Lvl {zone.zoneType.level})
                          </Badge>
                        )}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Assigned Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Zones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {assignedZones.length === 0 ? (
                <p className="text-sm text-muted-foreground">No zones assigned</p>
              ) : (
                assignedZones.map((zone) => (
                  <div key={zone.id} className="flex items-center space-x-2 p-2 border rounded bg-blue-50">
                    <Checkbox
                      id={`assigned-${zone.id}`}
                      checked={true}
                      onCheckedChange={(checked) => handleZoneToggle(zone.id, checked as boolean)}
                    />
                    <label 
                      htmlFor={`assigned-${zone.id}`} 
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <div className="font-medium">{zone.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconMapPin size={12} />
                        {zone.location}
                        {zone.zoneType && (
                          <Badge className={`text-xs ${getZoneTypeColor(zone.zoneType.name || '')}`}>
                            {zone.zoneType.name} (Lvl {zone.zoneType.level})
                          </Badge>
                        )}
                      </div>
                    </label>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            <IconArrowLeft size={16} className="mr-2" />
            Previous
          </Button>
          <Button onClick={handleStep2Submit} disabled={selectedZoneIds.length === 0}>
            Review Profile
            <IconArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  const renderStep3 = () => {
    const selectedSchedule = schedules.find(s => s.id === profileData.scheduleId)
    const selectedZones = zones.filter(zone => selectedZoneIds.includes(zone.id))

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Profile Summary</h3>
          <p className="text-sm text-muted-foreground">Review the profile details before saving</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IconCheck className="text-green-600" size={20} />
              {profileData.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Schedule</h4>
              {selectedSchedule ? (
                <div className="flex items-center gap-2 text-sm">
                  <IconClock size={16} />
                  <span>{selectedSchedule.name}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No schedule assigned</p>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Zone Access ({selectedZones.length} zones)</h4>
              <div className="space-y-2">
                {selectedZones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{zone.name}</div>
                      <div className="text-xs text-muted-foreground">{zone.location}</div>
                    </div>
                    {zone.zoneType && (
                      <Badge className={`text-xs ${getZoneTypeColor(zone.zoneType.name || '')}`}>
                        {zone.zoneType.name}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(2)}>
            <IconArrowLeft size={16} className="mr-2" />
            Previous
          </Button>
          <Button onClick={handleFinalSubmit}>
            <IconCheck size={16} className="mr-2" />
            {current ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </div>
    )
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Create Profile - Step 1: Basic Info'
      case 2: return 'Create Profile - Step 2: Zone Assignment'
      case 3: return 'Create Profile - Step 3: Review & Save'
      default: return 'Create Profile'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Enter profile name and select schedule'
      case 2: return 'Assign zones to this profile'
      case 3: return 'Review profile details before saving'
      default: return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 py-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-12 h-1 ${
            currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-12 h-1 ${
            currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>

        {/* Step content */}
        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
