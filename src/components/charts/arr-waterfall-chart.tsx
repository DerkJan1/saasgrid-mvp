'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, parseISO } from 'date-fns'

interface ARRWaterfallChartProps {
  data: Array<{
    month: string
    totalMRR: number
    newMRR: number
    expansionMRR: number
    contractionMRR: number
    churnedMRR: number
    arr: number
    netRevenueRetention: number
  }>
}

export function ARRWaterfallChart({ data }: ARRWaterfallChartProps) {
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

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  // Calculate retained ARR for waterfall effect
  const chartData = data.map((item, index) => {
    const previousARR = index > 0 ? data[index - 1].arr : 0
    const retainedARR = Math.max(0, previousARR - item.churnedMRR * 12 - item.contractionMRR * 12)
    
    return {
      ...item,
      monthFormatted: formatMonth(item.month),
      retainedARR,
      newARR: item.newMRR * 12,
      expansionARR: item.expansionMRR * 12,
      contractionARR: -item.contractionMRR * 12, // Negative for visual effect
      churnedARR: -item.churnedMRR * 12, // Negative for visual effect
      nrrPercent: item.netRevenueRetention
    }
  })

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>ARR Waterfall Analysis</CardTitle>
        <CardDescription>
          Annual Recurring Revenue breakdown showing growth drivers and churn impact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
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
                yAxisId="arr"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                yAxisId="nrr"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatPercent(value)}
                domain={[0, 2]}
              />
              
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'nrrPercent') {
                    return [formatPercent(value), 'Net Revenue Retention']
                  }
                  return [formatCurrency(Math.abs(value)), name]
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
              
              {/* Stacked bars for ARR components */}
              <Bar
                yAxisId="arr"
                dataKey="retainedARR"
                stackId="positive"
                fill="#3b82f6"
                name="Retained ARR"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="arr"
                dataKey="newARR"
                stackId="positive"
                fill="#f59e0b"
                name="New ARR"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="arr"
                dataKey="expansionARR"
                stackId="positive"
                fill="#10b981"
                name="Expansion ARR"
                radius={[2, 2, 0, 0]}
              />
              
              {/* Negative bars for churn and contraction */}
              <Bar
                yAxisId="arr"
                dataKey="contractionARR"
                stackId="negative"
                fill="#fb923c"
                name="Contraction ARR"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                yAxisId="arr"
                dataKey="churnedARR"
                stackId="negative"
                fill="#dc2626"
                name="Churned ARR"
                radius={[0, 0, 2, 2]}
              />
              
              {/* NRR trend line */}
              <Line
                yAxisId="nrr"
                type="monotone"
                dataKey="nrrPercent"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                name="NRR %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend explanation */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Retained ARR: Revenue from existing customers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>New ARR: Revenue from new customers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Expansion ARR: Upsells and upgrades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>Contraction ARR: Downgrades and reductions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Churned ARR: Lost customers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
            <span>NRR %: Net Revenue Retention rate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
