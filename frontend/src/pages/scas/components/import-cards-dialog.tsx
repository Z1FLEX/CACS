import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { addAccessCard } from '@/services'
import { IconUpload, IconFileText, IconX } from '@tabler/icons-react'
import {
  accessCardImportDescription,
  accessCardImportExampleData,
  accessCardStatusOptions,
  buildNewAccessCardDraft,
  type AccessCardCreateValues,
} from '../lib/access-card-create'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ImportCardsDialog({ open, onOpenChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [parsedCards, setParsedCards] = useState<AccessCardCreateValues[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'))
    
    if (csvFile) {
      processCSVFile(csvFile)
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processCSVFile(file)
    }
  }

  const processCSVFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string) => {
    try {
      const lines = text.trim().split('\n')
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
      type AccessCardStatus = AccessCardCreateValues['status']
      
      const cardNumberIndex = headers.findIndex(h => 
        h.includes('card') || h.includes('uid') || h.includes('number')
      )
      const statusIndex = headers.findIndex(h => h.includes('status'))
      
      if (cardNumberIndex === -1) {
        toast({
          title: 'Invalid CSV format',
          description: 'CSV must contain a Card UID column.',
          variant: 'destructive',
        })
        return
      }

      const cards: AccessCardCreateValues[] = []
      const validStatuses = new Set<AccessCardStatus>(accessCardStatusOptions.map((option) => option.value))
      let invalidStatusCount = 0
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const cardNumber = values[cardNumberIndex]
        const rawStatus = (statusIndex >= 0 ? values[statusIndex]?.toUpperCase() : '') as AccessCardStatus | ''
        const status: AccessCardStatus = rawStatus && validStatuses.has(rawStatus) ? rawStatus : 'ACTIVE'

        if (rawStatus && !validStatuses.has(rawStatus)) {
          invalidStatusCount++
        }
        
        if (cardNumber && cardNumber !== '') {
          cards.push({
            cardNumber,
            status,
          })
        }
      }

      if (cards.length === 0) {
        toast({
          title: 'No valid cards found',
          description: 'CSV file does not contain any valid card numbers.',
          variant: 'destructive',
        })
        return
      }

      setParsedCards(cards)
      toast({
        title: 'CSV parsed successfully',
        description: invalidStatusCount > 0
          ? `Found ${cards.length} card(s) to import. ${invalidStatusCount} row(s) used ACTIVE because the status value was invalid.`
          : `Found ${cards.length} card(s) to import.`,
      })
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: 'Please check your CSV file format.',
        variant: 'destructive',
      })
    }
  }

  const handleImport = async () => {
    if (parsedCards.length === 0) return

    setIsProcessing(true)
    let successCount = 0
    let errorCount = 0

    for (const cardData of parsedCards) {
      try {
        await addAccessCard(buildNewAccessCardDraft(cardData))
        successCount++
      } catch (error) {
        errorCount++
      }
    }

    setIsProcessing(false)
    
    toast({
      title: 'Import completed',
      description: `Successfully imported ${successCount} card(s).${errorCount > 0 ? ` ${errorCount} card(s) failed.` : ''}`,
      variant: errorCount > 0 ? 'destructive' : 'default',
    })

    if (successCount > 0) {
      setParsedCards([])
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setParsedCards([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Import Access Cards</DialogTitle>
          <DialogDescription>
            {accessCardImportDescription}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {parsedCards.length === 0 ? (
            <Card>
              <CardContent className='p-6'>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <IconUpload className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
                  <div className='space-y-2'>
                    <p className='text-lg font-medium'>Drop CSV file here</p>
                    <p className='text-sm text-muted-foreground'>or click to browse</p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type='file'
                    accept='.csv'
                    onChange={handleFileSelect}
                    className='hidden'
                    id='csv-upload'
                  />
                  <Button
                    variant='outline'
                    className='mt-4'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select CSV File
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <IconFileText className='h-5 w-5' />
                    <span className='font-medium'>Cards to Import ({parsedCards.length})</span>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setParsedCards([])
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <IconX className='h-4 w-4' />
                  </Button>
                </div>
                <div className='max-h-60 overflow-y-auto space-y-2'>
                  {parsedCards.slice(0, 10).map((card, index) => (
                    <div key={index} className='flex items-center justify-between p-2 bg-muted rounded'>
                      <span className='text-sm font-mono'>{card.cardNumber}</span>
                      <span className='text-xs text-muted-foreground'>Status: {card.status}</span>
                    </div>
                  ))}
                  {parsedCards.length > 10 && (
                    <p className='text-sm text-muted-foreground text-center py-2'>
                      ... and {parsedCards.length - 10} more cards
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className='text-xs text-muted-foreground'>
            <p className='font-medium mb-1'>CSV Format Requirements:</p>
            <ul className='list-disc list-inside space-y-1'>
              <li>First row should contain column headers</li>
              <li>Supported columns are Card UID and Status</li>
              <li>Status is optional and must be ACTIVE, INACTIVE, or REVOKED</li>
              <li>Each row should have a card UID</li>
              <li>Example header: cardNumber,status</li>
              <li>Example rows: {accessCardImportExampleData.map((row) => `${row.cardNumber},${row.status}`).join(' | ')}</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          {parsedCards.length > 0 && (
            <Button onClick={handleImport} disabled={isProcessing}>
              {isProcessing ? 'Importing...' : `Import ${parsedCards.length} Cards`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
