import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { IconPlus } from '@tabler/icons-react'
import { getProfiles, subscribeProfiles, loadProfiles, removeProfile } from '@/services'
import AddProfileDialog from './components/add-profile-dialog'

export default function AccessProfilesPage() {
  const [profiles, setProfiles] = useState(() => getProfiles())
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<any | null>(null)

  useEffect(() => {
    const unsub = subscribeProfiles(setProfiles)
    loadProfiles().then(() => {})
    return unsub
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
              <p className='text-sm text-muted-foreground'>{profile.description}</p>
              <div className='flex gap-2'>
                <span className='text-sm'>Permissions: {profile.permissions}</span>
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
