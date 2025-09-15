import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Target } from 'lucide-react'

interface KPICardsProps {
  metrics: {
    mrr: number
    arr: number
    customerCount: number
    nrr: number
    grr: number
    churnRate: number
  }
  previousMetrics?: {
    mrr: number
    customerCount: number
  }
}

export function KPICards({ metrics, previousMetrics }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const calculateChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  const mrrChange = calculateChange(metrics.mrr, previousMetrics?.mrr)
  const customerChange = calculateChange(metrics.customerCount, previousMetrics?.customerCount)

  const cards = [
    {
      title: 'Monthly Recurring Revenue',
      value: formatCurrency(metrics.mrr),
      change: mrrChange,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Annual Recurring Revenue',
      value: formatCurrency(metrics.arr),
      change: mrrChange,
      icon: Target,
      color: 'text-blue-600',
    },
    {
      title: 'Active Customers',
      value: metrics.customerCount.toLocaleString(),
      change: customerChange,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Net Revenue Retention',
      value: formatPercentage(metrics.nrr),
      icon: TrendingUp,
      color: metrics.nrr >= 1 ? 'text-green-600' : 'text-orange-600',
    },
    {
      title: 'Gross Revenue Retention',
      value: formatPercentage(metrics.grr),
      icon: Activity,
      color: metrics.grr >= 0.9 ? 'text-green-600' : 'text-orange-600',
    },
    {
      title: 'Customer Churn Rate',
      value: formatPercentage(metrics.churnRate),
      icon: TrendingDown,
      color: metrics.churnRate <= 0.05 ? 'text-green-600' : 'text-red-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              {card.change !== null && card.change !== undefined && (
                <p className={`text-xs flex items-center mt-1 ${
                  card.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(card.change).toFixed(1)}% from last month
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
