import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { Badge } from '@/components/ui/badge'
import { IconPlus, IconClock, IconMapPin } from '@tabler/icons-react'
import { getProfiles, subscribeProfiles, loadProfiles, removeProfile, loadSchedules, loadZones, getSchedules, getZones } from '@/services'
import AddProfileDialog from './components/add-profile-dialog'

export default function AccessProfilesPage() {
  const [profiles, setProfiles] = useState(() => getProfiles())
  const [schedules, setSchedules] = useState(() => getSchedules())
  const [zones, setZones] = useState(() => getZones())
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<any | null>(null)

  useEffect(() => {
    const unsub = subscribeProfiles(setProfiles)
    loadProfiles().then(() => {})
    return unsub
  }, [])

  useEffect(() => {
    // Load schedules and zones for display
    const loadScheduleAndZoneData = async () => {
      try {
        await Promise.all([
          loadSchedules(),
          loadZones()
        ])
        // After loading, update state with fresh data
        setSchedules(getSchedules())
        setZones(getZones())
      } catch (error) {
        console.error('Failed to load schedules and zones:', error)
      }
    }
    
    loadScheduleAndZoneData()
  }, [])

  const handleEdit = (id: string) => {
    const p = profiles.find(x => x.id === id)
    if (p) {
      setCurrent(p)
      setOpen(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm(`Delete profile ${id}?`)) {
      await removeProfile(id)
    }
  }

  const getScheduleName = (scheduleId?: string) => {
    if (!scheduleId) return 'No schedule'
    const schedule = schedules.find(s => s.id === scheduleId)
    return schedule?.name || 'Unknown schedule'
  }

  const getZoneNames = (zoneIds?: string[]) => {
    if (!zoneIds || zoneIds.length === 0) return ['No zones assigned']
    return zoneIds.map(id => {
      const zone = zones.find(z => z.id === id)
      return zone?.name || 'Unknown zone'
    })
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

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Access Profiles</h2>
          <p className='text-muted-foreground'>Define and manage access permission sets</p>
        </div>
        <Button onClick={() => setOpen(true)} className='gap-2'>
          <IconPlus size={16} />
          Create Profile
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle className='text-lg'>{profile.name}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <IconClock size={14} />
                  <span className='font-medium'>Schedule:</span>
                  <span className='text-muted-foreground'>{getScheduleName(profile.scheduleId)}</span>
                </div>
                
                <div className='flex items-start gap-2 text-sm'>
                  <IconMapPin size={14} className='mt-0.5' />
                  <div>
                    <span className='font-medium'>Zones:</span>
                    <div className='mt-1 space-y-1'>
                      {getZoneNames(profile.zoneIds).slice(0, 3).map((zoneName, index) => {
                        const zoneId = profile.zoneIds?.[index]
                        const zone = zones.find(z => z.id === zoneId)
                        return (
                          <div key={index} className='flex items-center gap-1'>
                            <span className='text-muted-foreground text-xs'>• {zoneName}</span>
                            {zone?.zoneType && (
                              <Badge className={`text-xs ${getZoneTypeColor(zone.zoneType.name || '')}`}>
                                {zone.zoneType.name}
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                      {profile.zoneIds && profile.zoneIds.length > 3 && (
                        <span className='text-muted-foreground text-xs'>
                          +{profile.zoneIds.length - 3} more zones
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className='flex gap-2 pt-2'>
                <Button variant='outline' size='sm' onClick={() => handleEdit(profile.id)}>
                  Edit
                </Button>
                <Button variant='outline' size='sm' onClick={() => handleDelete(profile.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <AddProfileDialog open={open} onOpenChange={(s) => { if (!s) setCurrent(null); setOpen(s) }} current={current} />
    </div>
  )
}
