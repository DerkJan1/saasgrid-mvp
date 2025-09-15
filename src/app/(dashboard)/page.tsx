import { KPICards } from '@/components/dashboard/kpi-cards'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, TrendingUp } from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration - in real app this would come from database
const mockMetrics = {
  mrr: 125000,
  arr: 1500000,
  customerCount: 45,
  nrr: 1.15,
  grr: 0.92,
  churnRate: 0.03,
}

const mockPreviousMetrics = {
  mrr: 118000,
  customerCount: 43,
}

const mockChartData = [
  {
    month: '2024-01',
    totalMRR: 100000,
    newMRR: 15000,
    expansionMRR: 8000,
    contractionMRR: 2000,
    churnedMRR: 3000,
  },
  {
    month: '2024-02',
    totalMRR: 108000,
    newMRR: 12000,
    expansionMRR: 6000,
    contractionMRR: 1500,
    churnedMRR: 2500,
  },
  {
    month: '2024-03',
    totalMRR: 118000,
    newMRR: 18000,
    expansionMRR: 7000,
    contractionMRR: 2000,
    churnedMRR: 3000,
  },
  {
    month: '2024-04',
    totalMRR: 125000,
    newMRR: 14000,
    expansionMRR: 9000,
    contractionMRR: 1800,
    churnedMRR: 2200,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back!</h2>
        <p className="text-gray-600 mt-2">
          Here&apos;s an overview of your SaaS metrics performance.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/upload">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload New Data
          </Button>
        </Link>
        <Link href="/analytics">
          <Button variant="outline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            View Analytics
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <KPICards metrics={mockMetrics} previousMetrics={mockPreviousMetrics} />

      {/* Charts */}
      <div className="grid gap-6">
        <RevenueChart data={mockChartData} />
        
        {/* Placeholder for additional charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>
                Track your customer acquisition over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart coming soon...
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Retention Metrics</CardTitle>
              <CardDescription>
                Monitor your retention rates and churn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart coming soon...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
