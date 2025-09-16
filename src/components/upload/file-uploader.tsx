'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { parseSpreadsheet } from '@/lib/file-parser'
import { CustomerMonth } from '@/types'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants'

interface FileUploaderProps {
  onUploadComplete: (data: CustomerMonth[]) => void
  isLoading?: boolean
}

export function FileUploader({ onUploadComplete, isLoading = false }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(null)
    
    // Validate file type
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'))
    
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      setError(`Please upload a valid spreadsheet file (${ALLOWED_FILE_TYPES.join(', ')})`)
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB')
      return
    }

    setIsUploading(true)

    try {
      const data = await parseSpreadsheet(file)
      setSuccess(`Successfully parsed ${data.length} records from ${file.name}`)
      onUploadComplete(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const disabled = isUploading || isLoading

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload MRR Data
        </CardTitle>
        <CardDescription>
          Upload your spreadsheet with monthly MRR data. Supported formats: {ALLOWED_FILE_TYPES.join(', ')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Processing file...' : 'Drop your file here'}
            </p>
            <p className="text-sm text-gray-600">
              or click to browse your files
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          <Button
            className="mt-4"
            variant="outline"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
          >
            {isUploading ? 'Processing...' : 'Select File'}
          </Button>
        </div>

        {/* File format help */}
        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-medium">Supported formats:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Long format:</strong> customerId, customerName, month, mrr columns</li>
            <li><strong>Wide format:</strong> Customer names + month columns (Jan/23, Feb/23, etc.)</li>
            <li><strong>Month formats:</strong> YYYY-MM, MM/YYYY, Jan/23, Jan-2023, etc.</li>
            <li><strong>Empty cells:</strong> Automatically handled (represents churn)</li>
            <li><strong>Values:</strong> Numeric only (no currency symbols)</li>
          </ul>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
