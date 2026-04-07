import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { IconSearch, IconAdjustments } from '@tabler/icons-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ColumnConfig {
  key: string
  label: string
  visible?: boolean
  sortable?: boolean
}

interface TableDataWrapperProps {
  data: any[]
  columns: ColumnConfig[]
  itemsPerPage?: number
  searchableFields?: string[]
  children: (props: {
    data: any[]
    visibleColumns: ColumnConfig[]
    currentPage: number
  }) => React.ReactNode
}

export function TableDataWrapper({
  data,
  columns,
  itemsPerPage = 10,
  searchableFields = [],
  children,
}: TableDataWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleColumns, setVisibleColumns] = useState<ColumnConfig[]>(
    columns.map(col => ({
      ...col,
      visible: col.visible !== false
    }))
  )

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    return data.filter(item =>
      searchableFields.some(field => {
        const value = String(item[field] || '').toLowerCase()
        return value.includes(query)
      })
    )
  }, [data, searchQuery, searchableFields])

  // Paginate filtered data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  // Toggle column visibility
  const handleToggleColumn = (key: string) => {
    setVisibleColumns(prev =>
      prev.map(col =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    )
  }

  // Reset visible columns
  const handleResetColumns = () => {
    setVisibleColumns(prev =>
      prev.map(col => ({
        ...col,
        visible: true
      }))
    )
  }

  return (
    <div className='space-y-4'>
      {/* Search and Column Visibility Controls */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <IconSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-10'
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm' className='gap-2'>
              <IconAdjustments size={16} />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-56' align='end'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium text-sm'>Show/Hide Columns</h4>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleResetColumns}
                  className='h-6 text-xs'
                >
                  Reset
                </Button>
              </div>

              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {visibleColumns.map(column => (
                  <div key={column.key} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`col-${column.key}`}
                      checked={column.visible}
                      onCheckedChange={() => handleToggleColumn(column.key)}
                    />
                    <Label
                      htmlFor={`col-${column.key}`}
                      className='text-sm font-normal cursor-pointer'
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table Children */}
      {children({
        data: paginatedData,
        visibleColumns: visibleColumns.filter(col => col.visible),
        currentPage,
      })}

      {/* Pagination Controls */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}{' '}
          entries
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className='gap-1'
          >
            <ChevronLeft size={16} />
            Previous
          </Button>

          <div className='flex items-center gap-1'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size='sm'
                onClick={() => setCurrentPage(page)}
                className='w-8 h-8 p-0'
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className='gap-1'
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
