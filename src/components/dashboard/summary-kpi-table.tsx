'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'

interface SummaryKPITableProps {
  data: Array<{
    month: string
    arr: number
    netRevenueRetention: number
    grossRevenueRetention: number
    customerCount: number
    newMRR: number
    expansionMRR: number
    contractionMRR: number
    churnedMRR: number
  }>
}

export function SummaryKPITable({ data }: SummaryKPITableProps) {
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

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const formatMonth = (month: string) => {
    try {
      return format(parseISO(`${month}-01`), 'MMM yyyy')
    } catch {
      return month
    }
  }

  // Calculate additional metrics
  const tableData = data.map((item, index) => {
    const previousItem = index > 0 ? data[index - 1] : null
    const yoyGrowth = previousItem ? ((item.arr - previousItem.arr) / previousItem.arr) * 100 : 0
    
    // Calculate Magic Number
    const netNewMRR = item.newMRR + item.expansionMRR
    const lostMRR = item.churnedMRR + item.contractionMRR
    const magicNumber = lostMRR > 0 ? netNewMRR / lostMRR : netNewMRR > 0 ? 5 : 0

    return {
      ...item,
      monthFormatted: formatMonth(item.month),
      yoyGrowth,
      magicNumber: Math.round(magicNumber * 100) / 100
    }
  })

  // Show last 12 months
  const recentData = tableData.slice(-12)

  const getGrowthBadge = (growth: number) => {
    if (growth >= 20) return <Badge className="bg-green-100 text-green-800">High</Badge>
    if (growth >= 10) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (growth >= 0) return <Badge className="bg-yellow-100 text-yellow-800">Slow</Badge>
    return <Badge className="bg-red-100 text-red-800">Declining</Badge>
  }

  const getNRRBadge = (nrr: number) => {
    if (nrr >= 1.2) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (nrr >= 1.0) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (nrr >= 0.9) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary KPI</CardTitle>
        <CardDescription>
          Monthly performance metrics overview - last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Month</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">ARR</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">NDR (TTM)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">GRR</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Customers</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Magic #</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Growth</th>
              </tr>
            </thead>
            <tbody>
              {recentData.map((row, index) => (
                <tr 
                  key={row.month} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index === recentData.length - 1 ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="py-3 px-2 font-medium text-gray-900">
                    {row.monthFormatted}
                    {index === recentData.length - 1 && (
                      <Badge variant="secondary" className="ml-2 text-xs">Latest</Badge>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {formatCurrency(row.arr)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {formatPercent(row.netRevenueRetention)}
                      {getNRRBadge(row.netRevenueRetention)}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {formatPercent(row.grossRevenueRetention)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {row.customerCount}
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {row.magicNumber.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {row.yoyGrowth.toFixed(1)}%
                      {getGrowthBadge(row.yoyGrowth)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatPercent(recentData[recentData.length - 1]?.netRevenueRetention || 0)}
            </div>
            <div className="text-xs text-gray-600">Current NDR</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {recentData[recentData.length - 1]?.magicNumber.toFixed(1) || '0.0'}
            </div>
            <div className="text-xs text-gray-600">Current Magic #</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {recentData[recentData.length - 1]?.customerCount || 0}
            </div>
            <div className="text-xs text-gray-600">Total Customers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(recentData[recentData.length - 1]?.arr || 0)}
            </div>
            <div className="text-xs text-gray-600">Current ARR</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
