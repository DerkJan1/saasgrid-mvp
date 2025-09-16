'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/upload/file-uploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react'
import { CustomerMonth } from '@/types'
import { SaaSMetricsCalculator } from '@/lib/calculations/metrics'
import { DataStore } from '@/lib/data-store'
import Link from 'next/link'

export default function UploadPage() {
  const [uploadedData, setUploadedData] = useState<CustomerMonth[] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingResult, setProcessingResult] = useState<{
    success: boolean
    message: string
    metricsCount?: number
  } | null>(null)
  const [debugInfo, setDebugInfo] = useState<{
    totalRecords: number
    uniqueCustomers: string[]
    sampleRecords: CustomerMonth[]
    dateRange: string
  } | null>(null)

  const handleUploadComplete = async (data: CustomerMonth[]) => {
    setUploadedData(data)
    setProcessingResult(null)
    
    // Generate debug info for display
    const uniqueCustomers = [...new Set(data.map(d => d.customerId))]
    const months = [...new Set(data.map(d => d.month))].sort()
    const dateRange = months.length > 0 ? `${months[0]} to ${months[months.length - 1]}` : 'No dates'
    
    setDebugInfo({
      totalRecords: data.length,
      uniqueCustomers,
      sampleRecords: data.slice(0, 10), // First 10 records
      dateRange
    })
  }

  const handleProcessData = async () => {
    if (!uploadedData) return

    setIsProcessing(true)
    
    try {
      // Calculate metrics from uploaded data
      const metrics = SaaSMetricsCalculator.calculateMetrics(uploadedData)
      
      // Save data to localStorage for dashboard access
      DataStore.saveCustomerData(uploadedData)
      
      // Trigger storage event for dashboard update
      window.dispatchEvent(new Event('storage'))
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
              <h4 className="font-medium text-gray-900 mb-2">Supported Data Formats:</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-gray-900">Long Format (one row per customer-month):</p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4">
                    <li><strong>customerId:</strong> Unique identifier</li>
                    <li><strong>customerName:</strong> Display name</li>
                    <li><strong>month:</strong> YYYY-MM format (e.g., 2024-01)</li>
                    <li><strong>mrr:</strong> Revenue amount (numeric)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Wide Format (customers as rows, months as columns):</p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4">
                    <li><strong>Customer names</strong> in first column</li>
                    <li><strong>Month headers:</strong> Jan/23, Feb/23, 2023-01, etc.</li>
                    <li><strong>Empty cells</strong> represent customer churn</li>
                    <li><strong>Auto-generates</strong> customer IDs if missing</li>
                  </ul>
                </div>
              </div>
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

      {/* Debug Information */}
      {debugInfo && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              🔍 Debug Information
            </CardTitle>
            <CardDescription>
              Raw parsing results to help diagnose issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Total Records:</span>
                <p className="text-gray-600">{debugInfo.totalRecords}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Unique Customers:</span>
                <p className="text-gray-600">{debugInfo.uniqueCustomers.length}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Date Range:</span>
                <p className="text-gray-600">{debugInfo.dateRange}</p>
              </div>
            </div>

            {/* Customer List */}
            <div>
              <span className="font-medium text-gray-900">Customer IDs Found:</span>
              <div className="mt-1 p-2 bg-white rounded border text-xs">
                {debugInfo.uniqueCustomers.length > 0 ? (
                  debugInfo.uniqueCustomers.map((id, index) => (
                    <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-1">
                      {id}
                    </span>
                  ))
                ) : (
                  <span className="text-red-600">No customers found</span>
                )}
              </div>
            </div>

            {/* Sample Records */}
            <div>
              <span className="font-medium text-gray-900">Sample Records:</span>
              <div className="mt-1 p-2 bg-white rounded border text-xs max-h-40 overflow-y-auto">
                {debugInfo.sampleRecords.length > 0 ? (
                  debugInfo.sampleRecords.map((record, index) => (
                    <div key={index} className="mb-1 p-1 border-b border-gray-100">
                      <strong>{record.customerName}</strong> ({record.customerId}) - {record.month}: ${record.mrr.toLocaleString()}
                    </div>
                  ))
                ) : (
                  <span className="text-red-600">No records found</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
