'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/upload/file-uploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react'
import { CustomerMonth } from '@/types'
import { SaaSMetricsCalculator } from '@/lib/calculations/metrics'
import Link from 'next/link'

export default function UploadPage() {
  const [uploadedData, setUploadedData] = useState<CustomerMonth[] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingResult, setProcessingResult] = useState<{
    success: boolean
    message: string
    metricsCount?: number
  } | null>(null)

  const handleUploadComplete = async (data: CustomerMonth[]) => {
    setUploadedData(data)
    setProcessingResult(null)
  }

  const handleProcessData = async () => {
    if (!uploadedData) return

    setIsProcessing(true)
    
    try {
      // Calculate metrics from uploaded data
      const metrics = SaaSMetricsCalculator.calculateMetrics(uploadedData)
      
      // In a real app, you would save this data to the database here
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setProcessingResult({
        success: true,
        message: `Successfully processed ${uploadedData.length} records and calculated ${metrics.length} months of metrics.`,
        metricsCount: metrics.length
      })
      
      // Clear uploaded data after processing
      setUploadedData(null)
    } catch (error) {
      setProcessingResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process data'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Upload Data</h2>
        <p className="text-gray-600 mt-2">
          Upload your MRR data to calculate and visualize your SaaS metrics.
        </p>
      </div>

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Before You Upload</CardTitle>
          <CardDescription>
            Make sure your data is formatted correctly for the best results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>customerId:</strong> Unique identifier for each customer</li>
                <li><strong>customerName:</strong> Display name for the customer</li>
                <li><strong>month:</strong> Month in YYYY-MM format (e.g., 2024-01)</li>
                <li><strong>mrr:</strong> Monthly recurring revenue amount (numeric only)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supported Formats:</h4>
              <p className="text-sm text-gray-600">
                Excel (.xlsx, .xls) and CSV (.csv) files up to 10MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Uploader */}
      <FileUploader 
        onUploadComplete={handleUploadComplete}
        isLoading={isProcessing}
      />

      {/* Data Preview and Processing */}
      {uploadedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Data Uploaded Successfully
            </CardTitle>
            <CardDescription>
              Review your data and process it to calculate metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Total Records:</span>
                  <p className="text-gray-600">{uploadedData.length}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Unique Customers:</span>
                  <p className="text-gray-600">
                    {new Set(uploadedData.map(d => d.customerId)).size}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Date Range:</span>
                  <p className="text-gray-600">
                    {uploadedData.map(d => d.month).sort()[0]} - {uploadedData.map(d => d.month).sort().slice(-1)[0]}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Total MRR:</span>
                  <p className="text-gray-600">
                    ${uploadedData.reduce((sum, d) => sum + d.mrr, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleProcessData} 
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Processing...' : 'Process Data & Calculate Metrics'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing Result */}
      {processingResult && (
        <Alert variant={processingResult.success ? 'default' : 'destructive'}>
          {processingResult.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className="flex items-center justify-between">
            <span>{processingResult.message}</span>
            {processingResult.success && (
              <Link href="/">
                <Button size="sm" className="ml-4">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
