import { useRef, useState } from 'react'
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
import { importAccessCards } from '@/services'
import { IconFileText, IconLoader, IconUpload, IconX } from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ImportCardsDialog({ open, onOpenChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const resetDialog = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetDialog()
    onOpenChange(false)
  }

  const acceptFile = (file?: File | null) => {
    if (!file) {
      return
    }

    if (!(file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv'))) {
      toast({
        title: 'Invalid file',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    acceptFile(event.dataTransfer.files?.[0] ?? null)
  }

  const handleImport = async () => {
    if (!selectedFile) {
      return
    }

    setIsProcessing(true)
    try {
      const importedCount = await importAccessCards(selectedFile)
      toast({
        title: 'Import completed',
        description: `Imported ${importedCount} card(s). Each card was hashed and saved in the inactive state.`,
      })
      handleClose()
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error?.response?.data?.message || 'Unable to import access cards.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : onOpenChange(nextOpen))}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Import Access Cards</DialogTitle>
          <DialogDescription>
            Upload a CSV file with a `uid` column and an optional `type` column. The backend hashes each UID, rejects duplicates, and creates all imported cards as inactive stock.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {!selectedFile ? (
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
                  <IconUpload className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <div className='space-y-2'>
                    <p className='text-lg font-medium'>Drop CSV file here</p>
                    <p className='text-sm text-muted-foreground'>or click to browse</p>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type='file'
                    accept='.csv'
                    onChange={(event) => acceptFile(event.target.files?.[0] ?? null)}
                    className='hidden'
                    id='access-card-csv-upload'
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
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <IconFileText className='h-5 w-5' />
                    <span className='font-medium'>{selectedFile.name}</span>
                  </div>
                  <Button variant='ghost' size='sm' onClick={resetDialog} disabled={isProcessing}>
                    <IconX className='h-4 w-4' />
                  </Button>
                </div>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <p>Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <p>Expected columns: `uid` and optional `type`.</p>
                  <p>Duplicate hashes already in stock or repeated in the file will fail the import.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || isProcessing}>
            {isProcessing ? (
              <>
                <IconLoader className='mr-2 h-4 w-4 animate-spin' />
                Importing...
              </>
            ) : (
              'Import Cards'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
