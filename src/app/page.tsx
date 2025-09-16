'use client'

import { useState, useEffect } from 'react'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { ARRWaterfallChart } from '@/components/charts/arr-waterfall-chart'
import { CustomerGrowthChart } from '@/components/charts/customer-growth-chart'
import { MagicNumberChart } from '@/components/charts/magic-number-chart'
import { ExpandableChart } from '@/components/charts/expandable-chart'
import { SummaryKPITable } from '@/components/dashboard/summary-kpi-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Trash2, FileSpreadsheet, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { DataStore } from '@/lib/data-store'
import { MonthlyMetrics } from '@/types'

export default function HomePage() {
  const [hasData, setHasData] = useState(false)
  const [metrics, setMetrics] = useState<MonthlyMetrics[]>([])
  const [dataSummary, setDataSummary] = useState<{
    uniqueCustomers: number;
    totalRecords: number;
    dateRange: string;
  } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load data on component mount
  useEffect(() => {
    const loadData = () => {
      const dataExists = DataStore.hasData()
      setHasData(dataExists)
      
      if (dataExists) {
        setMetrics(DataStore.getMetrics())
        setDataSummary(DataStore.getDataSummary())
      }
    }

    loadData()
    
    // Listen for storage changes (when data is uploaded)
    const handleStorageChange = () => {
      loadData()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleClearData = () => {
    DataStore.clearData()
    setHasData(false)
    setMetrics([])
    setDataSummary(null)
    setShowDeleteConfirm(false)
  }

  // Empty state when no data
  if (!hasData) {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome to SaaSGrid!</h2>
          <p className="text-gray-600 mt-2">
            Upload your MRR data to start tracking your SaaS metrics.
          </p>
        </div>

        {/* Empty State Card */}
        <Card className="text-center py-12">
          <CardContent>
            <FileSpreadsheet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by uploading your MRR data. We support both wide format (customers as rows, months as columns) and long format (one row per customer-month).
            </p>
            <Link href="/upload">
              <Button size="lg" className="flex items-center gap-2 mx-auto">
                <Upload className="h-5 w-5" />
                Upload Your First File
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 SaaS Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track MRR, ARR, churn rate, and revenue retention automatically.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 Growth Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Visualize customer growth, expansion, and contraction trends.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔄 Easy Import</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Upload Excel or CSV files directly from your accounting system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Dashboard with real data
  const currentMetrics = metrics[metrics.length - 1] // Latest month
  const previousMetrics = metrics[metrics.length - 2] // Previous month

  return (
    <div className="space-y-6">
      {/* Header with Data Summary */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-2">
            {dataSummary && `${dataSummary.uniqueCustomers} customers • ${dataSummary.totalRecords} records • ${dataSummary.dateRange}`}
          </p>
        </div>
        
        {/* Data Management Actions */}
        <div className="flex gap-2">
          <Link href="/upload">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New Data
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
            Clear Data
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Are you sure? This will permanently delete all your uploaded data.</span>
            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleClearData}>
                Delete All Data
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards with Real Data */}
      {currentMetrics && (
        <KPICards 
          metrics={{
            mrr: currentMetrics.totalMRR,
            arr: currentMetrics.arr,
            customerCount: currentMetrics.customerCount,
            nrr: currentMetrics.netRevenueRetention,
            grr: currentMetrics.grossRevenueRetention,
            churnRate: currentMetrics.logoChurnRate,
          }} 
          previousMetrics={previousMetrics ? {
            mrr: previousMetrics.totalMRR,
            customerCount: previousMetrics.customerCount,
          } : undefined}
        />
      )}

      {/* Charts with Real Data - SaaSGrid Layout with Better Spacing */}
      <div className="space-y-8">
        {/* Main ARR Chart - Full Width */}
        <div className="w-full">
          <ExpandableChart 
            title="ARR Waterfall Analysis"
            description="Annual Recurring Revenue breakdown showing growth drivers and churn impact"
          >
            <div className="h-96 w-full">
              <ARRWaterfallChart data={metrics} />
            </div>
          </ExpandableChart>
        </div>
        
        {/* Side-by-side Analytics - Better Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full">
            <ExpandableChart 
              title="Customer Growth"
              description="Customer acquisition, churn, and net growth over time"
            >
              <div className="h-80 w-full">
                <CustomerGrowthChart data={metrics} />
              </div>
            </ExpandableChart>
          </div>
          
          <div className="w-full">
            <ExpandableChart 
              title="Magic Number"
              description="Growth efficiency metric - measures new revenue generation relative to churn"
            >
              <div className="h-80 w-full">
                <MagicNumberChart data={metrics} />
              </div>
            </ExpandableChart>
          </div>
        </div>

        {/* Summary KPI Table - Full Width */}
        <div className="w-full">
          <SummaryKPITable data={metrics} />
        </div>
      </div>
    </div>
  )
}