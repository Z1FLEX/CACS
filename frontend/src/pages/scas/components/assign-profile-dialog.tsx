import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import type { Profile, User } from '@/types/scas'
import { assignUserProfiles, getProfiles, loadProfiles, subscribeProfiles } from '@/services'
import { IconLoader } from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
}

export default function AssignProfileDialog({ open, onOpenChange, user }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>(() => getProfiles())
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const unsub = subscribeProfiles(setProfiles)
    loadProfiles().catch((error) => {
      console.error('Failed to load profiles:', error)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!open || !user) return
    setSelectedProfileIds([...(user.profileIds ?? [])])
  }, [open, user])

  const selectedProfiles = useMemo(
    () => profiles.filter((profile) => selectedProfileIds.includes(profile.id)),
    [profiles, selectedProfileIds]
  )

  const toggleProfile = (profileId: string, checked: boolean) => {
    setSelectedProfileIds((current) => {
      if (checked) {
        return current.includes(profileId) ? current : [...current, profileId]
      }
      return current.filter((id) => id !== profileId)
    })
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await assignUserProfiles(user.id, selectedProfileIds)
      toast({
        title: 'Profiles updated',
        description:
          selectedProfileIds.length > 0
            ? `Updated profile access for ${user.name}.`
            : `All profiles were unassigned from ${user.name}.`,
      })
      onOpenChange(false)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to assign profiles. Please try again.'
      toast({
        title: 'Assignment failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Manage Profiles</DialogTitle>
          <DialogDescription>
            Assign or unassign access profiles for {user.name}. These profiles control the zones and schedules this user can access.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex flex-wrap gap-2'>
            {selectedProfiles.length > 0 ? (
              selectedProfiles.map((profile) => (
                <Badge key={profile.id} variant='secondary' className='gap-1'>
                  {profile.name}
                  <button
                    type='button'
                    aria-label={`Unassign ${profile.name}`}
                    className='ml-1 rounded-sm outline-none transition-opacity hover:opacity-70'
                    onClick={() => toggleProfile(profile.id, false)}
                    disabled={isSaving}
                  >
                    x
                  </button>
                </Badge>
              ))
            ) : (
              <span className='text-sm text-muted-foreground'>
                No profiles selected. Saving now will unassign all profiles from this user.
              </span>
            )}
          </div>

          <div className='max-h-80 space-y-3 overflow-y-auto rounded-md border p-4'>
            {profiles.length === 0 ? (
              <div className='text-sm text-muted-foreground'>
                No access profiles are available yet. Create a profile first, then assign it to this user.
              </div>
            ) : (
              profiles.map((profile) => {
                const checked = selectedProfileIds.includes(profile.id)
                return (
                  <label
                    key={profile.id}
                    className='flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50'
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleProfile(profile.id, value === true)}
                      disabled={isSaving}
                      className='mt-0.5'
                    />
                    <div className='space-y-1'>
                      <div className='font-medium'>{profile.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {profile.zoneIds.length} zone{profile.zoneIds.length === 1 ? '' : 's'} and {profile.scheduleIds.length} schedule{profile.scheduleIds.length === 1 ? '' : 's'}
                      </div>
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || profiles.length === 0} className='gap-2'>
            {isSaving && <IconLoader className='h-4 w-4 animate-spin' />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
