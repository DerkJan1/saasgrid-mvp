'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { Zap } from 'lucide-react'

interface MagicNumberChartProps {
  data: Array<{
    month: string
    newMRR: number
    expansionMRR: number
    contractionMRR: number
    churnedMRR: number
  }>
}

export function MagicNumberChart({ data }: MagicNumberChartProps) {
  const formatMonth = (month: string) => {
    try {
      return format(parseISO(`${month}-01`), 'MMM yy')
    } catch {
      return month
    }
  }

  // Calculate Magic Number for each month
  const chartData = data.map((item, index) => {
    if (index === 0) {
      return {
        ...item,
        monthFormatted: formatMonth(item.month),
        magicNumber: 0, // No previous data for first month
        efficiency: 'N/A'
      }
    }

    // Magic Number = (New MRR + Expansion MRR) / Previous Month's Sales & Marketing Spend
    // Since we don't have S&M spend yet, we'll use a proxy calculation
    // Magic Number = Net New MRR / (Churned MRR + Contraction MRR) 
    // This shows growth efficiency relative to losses
    
    const netNewMRR = item.newMRR + item.expansionMRR
    const lostMRR = item.churnedMRR + item.contractionMRR
    const magicNumber = lostMRR > 0 ? netNewMRR / lostMRR : netNewMRR > 0 ? 5 : 0
    
    let efficiency = 'Poor'
    if (magicNumber >= 1.5) efficiency = 'Excellent'
    else if (magicNumber >= 1.0) efficiency = 'Good'
    else if (magicNumber >= 0.7) efficiency = 'Fair'

    return {
      ...item,
      monthFormatted: formatMonth(item.month),
      magicNumber: Math.round(magicNumber * 100) / 100,
      efficiency,
      netNewMRR,
      lostMRR
    }
  })

  const latestMagicNumber = chartData[chartData.length - 1]?.magicNumber || 0
  const avgMagicNumber = chartData.length > 1 ? 
    chartData.slice(1).reduce((sum, item) => sum + item.magicNumber, 0) / (chartData.length - 1) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Magic Number
        </CardTitle>
        <CardDescription>
          Growth efficiency metric - measures new revenue generation relative to churn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Magic Number Display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {latestMagicNumber.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Current Magic Number
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            latestMagicNumber >= 1.5 ? 'bg-green-100 text-green-800' :
            latestMagicNumber >= 1.0 ? 'bg-blue-100 text-blue-800' :
            latestMagicNumber >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {chartData[chartData.length - 1]?.efficiency || 'N/A'}
          </div>
        </div>

        {/* Trend Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData.slice(1)} // Skip first month (no previous data)
              margin={{
                top: 5,
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
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax + 0.5']}
              />
              
              <Tooltip 
                formatter={(value: number) => [value.toFixed(2), 'Magic Number']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              
              {/* Magic Number trend line */}
              <Line
                type="monotone"
                dataKey="magicNumber"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2 }}
              />
              
              {/* Reference lines for benchmarks */}
              <Line
                type="monotone"
                data={chartData.map(d => ({ ...d, benchmark: 1.0 }))}
                dataKey="benchmark"
                stroke="#6b7280"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                legendType="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Magic Number Explanation */}
        <div className="mt-4 text-xs text-gray-600 space-y-1">
          <div><strong>Magic Number</strong> = (New MRR + Expansion MRR) ÷ (Churned MRR + Contraction MRR)</div>
          <div className="grid grid-cols-2 gap-2">
            <div>• <span className="text-green-600">≥1.5:</span> Excellent efficiency</div>
            <div>• <span className="text-blue-600">≥1.0:</span> Good efficiency</div>
            <div>• <span className="text-yellow-600">≥0.7:</span> Fair efficiency</div>
            <div>• <span className="text-red-600">&lt;0.7:</span> Poor efficiency</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
