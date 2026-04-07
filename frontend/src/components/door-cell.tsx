import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DoorCellProps {
  doorNames: string[]
}

export default function DoorCell({ doorNames }: DoorCellProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Handle 0 doors
  if (!doorNames || doorNames.length === 0) {
    return <span className='text-gray-500'>No doors linked</span>
  }

  // Handle 1-2 doors
  if (doorNames.length <= 2) {
    return (
      <div className='space-y-1'>
        {doorNames.map((doorName, index) => (
          <span key={index} className='inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1'>
            {doorName}
          </span>
        ))}
      </div>
    )
  }

  // Handle 3+ doors
  const visibleDoors = doorNames.slice(0, 2)
  const remainingCount = doorNames.length - 2

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className='space-y-1 cursor-pointer'>
          {visibleDoors.map((doorName, index) => (
            <span key={index} className='inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1'>
              {doorName}
            </span>
          ))}
          <span className='inline-block bg-gray-200 rounded px-2 py-1 text-xs mr-1 text-gray-600 hover:bg-gray-300'>
            +{remainingCount} more
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-64 p-3'>
        <div className='space-y-1'>
          {doorNames.map((doorName, index) => (
            <div key={index} className='text-sm py-1'>
              {doorName}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
