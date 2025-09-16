'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'
import { TrendingUp, Users } from 'lucide-react'

interface CustomerGrowthChartProps {
  data: Array<{
    month: string
    customerCount: number
    newMRR: number
    churnedMRR: number
  }>
}

export function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: value >= 1000000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(value)
  }

  const formatMonth = (month: string) => {
    try {
      return format(parseISO(`${month}-01`), 'MMM yy')
    } catch {
      return month
    }
  }

  // Calculate customer acquisition and churn counts
  const chartData = data.map((item, index) => {
    const previousCustomers = index > 0 ? data[index - 1].customerCount : 0
    const netCustomerGrowth = item.customerCount - previousCustomers
    
    // Estimate new and churned customers based on MRR changes
    // This is a simplified calculation - in reality you'd track customer additions/departures
    const avgMRRPerCustomer = item.customerCount > 0 ? (item.newMRR / item.customerCount) || 5000 : 5000
    const newCustomers = Math.round(item.newMRR / avgMRRPerCustomer)
    const churnedCustomers = Math.round(item.churnedMRR / avgMRRPerCustomer)
    
    return {
      ...item,
      monthFormatted: formatMonth(item.month),
      newCustomers: Math.max(0, newCustomers),
      churnedCustomers: Math.max(0, churnedCustomers),
      netCustomerGrowth,
      growthRate: previousCustomers > 0 ? (netCustomerGrowth / previousCustomers) * 100 : 0
    }
  })

  // Calculate summary stats
  const latestData = chartData[chartData.length - 1]
  const firstData = chartData[0]
  const totalGrowth = latestData ? latestData.customerCount - firstData.customerCount : 0
  const avgGrowthRate = chartData.length > 1 ? 
    chartData.slice(1).reduce((sum, item) => sum + item.growthRate, 0) / (chartData.length - 1) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Customer Growth
        </CardTitle>
        <CardDescription>
          Customer acquisition, churn, and net growth over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{latestData?.customerCount || 0}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">+{totalGrowth}</div>
            <div className="text-sm text-gray-600">Net Growth</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{avgGrowthRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Avg Growth Rate</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="monthFormatted" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="customers"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Customers', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="growth"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'Growth %', angle: 90, position: 'insideRight' }}
              />
              
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'growthRate') {
                    return [`${value.toFixed(1)}%`, 'Growth Rate']
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              
              {/* Stacked bars for customer changes */}
              <Bar
                yAxisId="customers"
                dataKey="newCustomers"
                stackId="customers"
                fill="#10b981"
                name="New Customers"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="customers"
                dataKey="churnedCustomers"
                stackId="customers"
                fill="#dc2626"
                name="Churned Customers"
                radius={[2, 2, 0, 0]}
              />
              
              {/* Total customer count line */}
              <Line
                yAxisId="customers"
                type="monotone"
                dataKey="customerCount"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Total Customers"
              />
              
              {/* Growth rate line */}
              <Line
                yAxisId="growth"
                type="monotone"
                dataKey="growthRate"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
                name="Growth Rate %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
