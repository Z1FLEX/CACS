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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { IconUpload, IconDownload, IconCheck, IconAlertTriangle } from '@tabler/icons-react'

interface CSVField {
  key: string
  label: string
  required: boolean
  type?: 'string' | 'number' | 'email' | 'enum'
  options?: string[]
}

interface ParsedRow {
  data: Record<string, any>
  errors: string[]
  isValid: boolean
}

interface ImportResult {
  total: number
  valid: number
  invalid: number
  imported: number
  failed: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  fields: CSVField[]
  exampleData: Record<string, any>[]
  onImport: (validRows: Record<string, any>[]) => Promise<number>
  templateFileName: string
}

export default function CSVImportDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  exampleData,
  onImport,
  templateFileName,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
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

  const downloadTemplate = () => {
    const headers = fields.map(f => f.label).join(',')
    const exampleRows = exampleData.map(row => 
      fields.map(f => row[f.key] || '').join(',')
    ).join('\n')
    
    const csvContent = `${headers}\n${exampleRows}`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = templateFileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const processCSVFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseAndValidateCSV(text)
    }
    reader.readAsText(file)
  }

  const validateField = (field: CSVField, value: string): string | null => {
    const trimmedValue = value.trim()
    
    if (field.required && !trimmedValue) {
      return `${field.label} is required`
    }
    
    if (!trimmedValue) return null
    
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmedValue)) {
          return `${field.label} must be a valid email`
        }
        break
      case 'enum':
        if (field.options && !field.options.includes(trimmedValue)) {
          return `${field.label} must be one of: ${field.options.join(', ')}`
        }
        break
      case 'number':
        if (isNaN(Number(trimmedValue))) {
          return `${field.label} must be a number`
        }
        break
    }
    
    return null
  }

  const parseAndValidateCSV = (text: string) => {
    try {
      const lines = text.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      // Map headers to field keys
      const headerToFieldMap = new Map<string, CSVField>()
      fields.forEach(field => {
        const headerIndex = headers.findIndex(h => 
          h.toLowerCase().includes(field.key.toLowerCase()) || 
          h.toLowerCase().includes(field.label.toLowerCase())
        )
        if (headerIndex !== -1) {
          headerToFieldMap.set(headers[headerIndex], field)
        }
      })
      
      if (headerToFieldMap.size === 0) {
        toast({
          title: 'Invalid CSV format',
          description: 'CSV headers do not match expected format.',
          variant: 'destructive',
        })
        return
      }

      const rows: ParsedRow[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const rowData: Record<string, any> = {}
        const errors: string[] = []
        
        headers.forEach((header, index) => {
          const field = headerToFieldMap.get(header)
          if (field) {
            const value = values[index] || ''
            const error = validateField(field, value)
            
            if (error) {
              errors.push(error)
            } else {
              // Convert to appropriate type
              let processedValue: any = value.trim()
              if (field.type === 'number' && processedValue) {
                processedValue = Number(processedValue)
              }
              rowData[field.key] = processedValue
            }
          }
        })
        
        // Check for missing required fields
        fields.forEach(field => {
          if (field.required && !(field.key in rowData)) {
            errors.push(`${field.label} is required`)
          }
        })
        
        rows.push({
          data: rowData,
          errors,
          isValid: errors.length === 0
        })
      }

      if (rows.length === 0) {
        toast({
          title: 'No valid data found',
          description: 'CSV file does not contain any valid rows.',
          variant: 'destructive',
        })
        return
      }

      setParsedRows(rows)
      setImportResult(null)
      
      const validCount = rows.filter(r => r.isValid).length
      toast({
        title: 'CSV parsed successfully',
        description: `Found ${rows.length} row(s): ${validCount} valid, ${rows.length - validCount} invalid.`,
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
    const validRows = parsedRows.filter(r => r.isValid)
    if (validRows.length === 0) return

    setIsProcessing(true)
    
    try {
      const importedCount = await onImport(validRows.map(r => r.data))
      
      setImportResult({
        total: parsedRows.length,
        valid: validRows.length,
        invalid: parsedRows.length - validRows.length,
        imported: importedCount,
        failed: validRows.length - importedCount
      })
      
      toast({
        title: 'Import completed',
        description: `Successfully imported ${importedCount} record(s).${importedCount < validRows.length ? ` ${validRows.length - importedCount} record(s) failed.` : ''}`,
        variant: importedCount === validRows.length ? 'default' : 'destructive',
      })
      
      if (importedCount > 0) {
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'An error occurred during import. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setParsedRows([])
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  const getProgressPercentage = () => {
    if (!importResult) return 0
    return (importResult.imported / importResult.valid) * 100
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {parsedRows.length === 0 ? (
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='font-medium'>Upload CSV File</h3>
                  <Button variant='outline' size='sm' onClick={downloadTemplate} className='gap-2'>
                    <IconDownload size={16} />
                    Download Template
                  </Button>
                </div>
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
            <>
              {/* Import Summary */}
              {importResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      {importResult.imported === importResult.valid ? (
                        <IconCheck className='h-5 w-5 text-green-600' />
                      ) : (
                        <IconAlertTriangle className='h-5 w-5 text-yellow-600' />
                      )}
                      Import Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-muted-foreground'>Total rows:</span>
                          <span className='ml-2 font-medium'>{importResult.total}</span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Valid rows:</span>
                          <span className='ml-2 font-medium text-green-600'>{importResult.valid}</span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Invalid rows:</span>
                          <span className='ml-2 font-medium text-red-600'>{importResult.invalid}</span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>Imported:</span>
                          <span className='ml-2 font-medium text-blue-600'>{importResult.imported}</span>
                        </div>
                      </div>
                      {importResult.imported < importResult.valid && (
                        <Progress value={getProgressPercentage()} className='w-full' />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Preview */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg'>Preview ({parsedRows.length} rows)</CardTitle>
                    <div className='flex gap-2'>
                      <Badge variant='secondary'>
                        {parsedRows.filter(r => r.isValid).length} valid
                      </Badge>
                      <Badge variant='destructive'>
                        {parsedRows.filter(r => !r.isValid).length} invalid
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='max-h-80 overflow-auto border rounded'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-12'>#</TableHead>
                          {fields.map(field => (
                            <TableHead key={field.key}>
                              {field.label}
                              {field.required && <span className='text-red-500 ml-1'>*</span>}
                            </TableHead>
                          ))}
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedRows.slice(0, 50).map((row, index) => (
                          <TableRow key={index} className={row.isValid ? '' : 'bg-red-50'}>
                            <TableCell className='font-medium'>{index + 1}</TableCell>
                            {fields.map(field => (
                              <TableCell key={field.key} className='font-mono text-sm'>
                                {row.data[field.key] || '-'}
                              </TableCell>
                            ))}
                            <TableCell>
                              {row.isValid ? (
                                <Badge variant='default' className='bg-green-600'>
                                  Valid
                                </Badge>
                              ) : (
                                <div className='space-y-1'>
                                  <Badge variant='destructive'>Invalid</Badge>
                                  {row.errors.map((error, i) => (
                                    <div key={i} className='text-xs text-red-600 max-w-xs'>
                                      {error}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {parsedRows.length > 50 && (
                      <div className='text-center py-2 text-sm text-muted-foreground border-t'>
                        Showing first 50 of {parsedRows.length} rows
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Field Requirements */}
          <div className='text-xs text-muted-foreground bg-muted p-3 rounded'>
            <p className='font-medium mb-1'>Required Fields:</p>
            <ul className='list-disc list-inside space-y-1'>
              {fields.filter(f => f.required).map(field => (
                <li key={field.key}>
                  <strong>{field.label}</strong>
                  {field.type && ` (${field.type})`}
                  {field.options && ` - Options: ${field.options.join(', ')}`}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isProcessing}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {parsedRows.length > 0 && !importResult && (
            <Button
              onClick={handleImport}
              disabled={isProcessing || parsedRows.filter(r => r.isValid).length === 0}
            >
              {isProcessing ? 'Importing...' : `Import ${parsedRows.filter(r => r.isValid).length} Valid Rows`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
