'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'

interface RevenueChartProps {
  data: Array<{
    month: string
    totalMRR: number
    newMRR: number
    expansionMRR: number
    contractionMRR: number
    churnedMRR: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatMonth = (month: string) => {
    try {
      return format(parseISO(`${month}-01`), 'MMM yyyy')
    } catch {
      return month
    }
  }

  const chartData = data.map(item => ({
    ...item,
    monthFormatted: formatMonth(item.month),
  }))

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardDescription>
          Monthly recurring revenue with breakdown by new, expansion, contraction, and churn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
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
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatCurrency(value), 
                  name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                ]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              
              {/* Stack areas for revenue breakdown */}
              <Area
                type="monotone"
                dataKey="newMRR"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="New MRR"
              />
              <Area
                type="monotone"
                dataKey="expansionMRR"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Expansion MRR"
              />
              <Area
                type="monotone"
                dataKey="contractionMRR"
                stackId="2"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
                name="Contraction MRR"
              />
              <Area
                type="monotone"
                dataKey="churnedMRR"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Churned MRR"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
