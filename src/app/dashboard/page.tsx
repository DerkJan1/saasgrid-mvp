'use client'

import { useState, useEffect } from 'react'
import { PremiumKPICards } from '@/components/dashboard/premium-kpi-cards'
import { ARRWaterfallChart } from '@/components/charts/arr-waterfall-chart'
import { CustomerGrowthChart } from '@/components/charts/customer-growth-chart'
import { MagicNumberChart } from '@/components/charts/magic-number-chart'
import { ExpandableChart } from '@/components/charts/expandable-chart'
import { PremiumChartContainer } from '@/components/charts/premium-chart-container'
import { SummaryKPITable } from '@/components/dashboard/summary-kpi-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Trash2, FileSpreadsheet, AlertCircle, BarChart3, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { DataStore } from '@/lib/data-store'
import { MonthlyMetrics } from '@/types'

export default function DashboardPage() {
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

  // Empty state when no data - SaaSBoard inspired design
  if (!hasData) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome to SaaSGrid</h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto">
              Your comprehensive SaaS analytics platform. Upload your data to unlock powerful insights.
            </p>
          </div>

          {/* CTA Section */}
          <div className="space-y-6">
            <Link href="/dashboard/upload">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg h-auto shadow-lg hover:shadow-xl transition-all">
                <Upload className="h-6 w-6 mr-3" />
                Upload Your Data
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500">
              Supports CSV, Excel (.xlsx), and legacy Excel (.xls) files
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-3 mt-16">
            <div className="text-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Revenue Tracking</h3>
              <p className="text-sm text-gray-600">
                Monitor MRR, ARR, and revenue retention metrics automatically
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Growth Analytics</h3>
              <p className="text-sm text-gray-600">
                Visualize customer growth, churn, and expansion trends
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Import</h3>
              <p className="text-sm text-gray-600">
                Upload files from any accounting or CRM system
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard with real data
  const currentMetrics = metrics[metrics.length - 1] // Latest month
  const previousMetrics = metrics[metrics.length - 2] // Previous month

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 isolate">
      {/* Header with Data Summary */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-2">
            {dataSummary && `${dataSummary.uniqueCustomers} customers • ${dataSummary.totalRecords} records • ${dataSummary.dateRange}`}
          </p>
        </div>
        
        {/* Data Management Actions */}
        <div className="flex gap-2">
          <Link href="/dashboard/upload">
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

      {/* Premium KPI Cards with Real Data */}
      {currentMetrics && (
        <PremiumKPICards 
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

      {/* Premium Charts with Real Data - Enhanced Layout */}
      <div className="space-y-8">
        {/* Main ARR Chart - Premium Container */}
        <PremiumChartContainer
          title="ARR Waterfall Analysis"
          subtitle="Annual Recurring Revenue breakdown showing growth drivers and churn impact"
          variant="premium"
          onExpand={() => {/* Handle expand */}}
          onExport={(format) => {/* Handle export */}}
        >
          <div className="h-[420px] w-full">
            <ARRWaterfallChart data={metrics} />
          </div>
        </PremiumChartContainer>
        
        {/* Side-by-side Analytics - Premium Containers */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-6">
            <PremiumChartContainer
              title="Customer Growth"
              subtitle="Customer acquisition, churn, and net growth over time"
              onExpand={() => {/* Handle expand */}}
              onExport={(format) => {/* Handle export */}}
            >
              <div className="h-[420px] w-full">
                <CustomerGrowthChart data={metrics} />
              </div>
            </PremiumChartContainer>
          </div>
          
          <div className="col-span-12 xl:col-span-6">
            <PremiumChartContainer
              title="Magic Number"
              subtitle="Growth efficiency metric - measures new revenue generation relative to churn"
              onExpand={() => {/* Handle expand */}}
              onExport={(format) => {/* Handle export */}}
            >
              <div className="h-[420px] w-full">
                <MagicNumberChart data={metrics} />
              </div>
            </PremiumChartContainer>
          </div>
        </div>

        {/* Summary KPI Table - Enhanced */}
        <PremiumChartContainer
          title="Monthly Performance Summary"
          subtitle="Comprehensive metrics overview for the last 12 months"
          actions={false}
          timeSelector={false}
        >
          <SummaryKPITable data={metrics} />
        </PremiumChartContainer>
      </div>
    </div>
  )
}
