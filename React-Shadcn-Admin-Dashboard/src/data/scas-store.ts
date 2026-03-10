import type { User, AccessCard, Zone, Door, Device, Profile, Schedule } from '@/types/scas'

type Subscriber<T> = (items: T[]) => void

class Store<T extends { id: string }> {
  private items: T[]
  private subs: Subscriber<T>[] = []

  constructor(initial: T[]) {
    this.items = [...initial]
  }

  list() {
    return this.items.slice()
  }

  subscribe(cb: Subscriber<T>) {
    this.subs.push(cb)
    cb(this.list())
    return () => {
      this.subs = this.subs.filter(s => s !== cb)
    }
  }

  push(item: T) {
    this.items = [item, ...this.items]
    this.subs.forEach(s => s(this.list()))
  }

  update(item: T) {
    const idx = this.items.findIndex(i => i.id === item.id)
    if (idx === -1) return false
    this.items[idx] = item
    this.subs.forEach(s => s(this.list()))
    return true
  }

  remove(id: string) {
    const prevLen = this.items.length
    this.items = this.items.filter(i => i.id !== id)
    if (this.items.length !== prevLen) {
      this.subs.forEach(s => s(this.list()))
      return true
    }
    return false
  }

  replace(items: T[]) {
    this.items = [...items]
    this.subs.forEach(s => s(this.list()))
  }
}

export const usersStore = new Store<User>([])
export const accessCardsStore = new Store<AccessCard>([])
export const zonesStore = new Store<Zone>([])
export const doorsStore = new Store<Door>([])
export const devicesStore = new Store<Device>([])
export const profilesStore = new Store<Profile>([])
export const schedulesStore = new Store<Schedule>([])

// Convenience helpers
export const getUsers = () => usersStore.list()
export const subscribeUsers = (cb: Subscriber<User>) => usersStore.subscribe(cb)
export const addUser = (u: User) => usersStore.push(u)
export const updateUser = (u: User) => usersStore.update(u)
export const removeUser = (id: string) => usersStore.remove(id)

export const getAccessCards = () => accessCardsStore.list()
export const subscribeAccessCards = (cb: Subscriber<AccessCard>) => accessCardsStore.subscribe(cb)
export const addAccessCard = (c: AccessCard) => accessCardsStore.push(c)
export const updateAccessCard = (c: AccessCard) => accessCardsStore.update(c)
export const removeAccessCard = (id: string) => accessCardsStore.remove(id)

export const getZones = () => zonesStore.list()
export const subscribeZones = (cb: Subscriber<Zone>) => zonesStore.subscribe(cb)
export const addZone = (z: Zone) => zonesStore.push(z)
export const updateZone = (z: Zone) => zonesStore.update(z)
export const removeZone = (id: string) => zonesStore.remove(id)

export const getDoors = () => doorsStore.list()
export const subscribeDoors = (cb: Subscriber<Door>) => doorsStore.subscribe(cb)
export const addDoor = (d: Door) => doorsStore.push(d)
export const updateDoor = (d: Door) => doorsStore.update(d)
export const removeDoor = (id: string) => doorsStore.remove(id)

export const getDevices = () => devicesStore.list()
export const subscribeDevices = (cb: Subscriber<Device>) => devicesStore.subscribe(cb)
export const addDevice = (d: Device) => devicesStore.push(d)
export const updateDevice = (d: Device) => devicesStore.update(d)
export const removeDevice = (id: string) => devicesStore.remove(id)

export const getProfiles = () => profilesStore.list()
export const subscribeProfiles = (cb: Subscriber<Profile>) => profilesStore.subscribe(cb)
export const addProfile = (p: Profile) => profilesStore.push(p)
export const updateProfile = (p: Profile) => profilesStore.update(p)
export const removeProfile = (id: string) => profilesStore.remove(id)

export const getSchedules = () => schedulesStore.list()
export const subscribeSchedules = (cb: Subscriber<Schedule>) => schedulesStore.subscribe(cb)
export const addSchedule = (s: Schedule) => schedulesStore.push(s)
export const updateSchedule = (s: Schedule) => schedulesStore.update(s)
export const removeSchedule = (id: string) => schedulesStore.remove(id)
