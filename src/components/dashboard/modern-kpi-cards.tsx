// Modern KPI Cards inspired by MekuHQ/saasboard (MIT License)
// Clean, professional metric display with improved visual hierarchy

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity, BarChart3, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModernKPICardsProps {
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

export function ModernKPICards({ metrics, previousMetrics }: ModernKPICardsProps) {
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
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'Current MRR',
    },
    {
      title: 'Annual Recurring Revenue',
      value: formatCurrency(metrics.arr),
      change: mrrChange,
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Annualized revenue',
    },
    {
      title: 'Active Customers',
      value: metrics.customerCount.toLocaleString(),
      change: customerChange,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Total active customers',
    },
    {
      title: 'Net Revenue Retention',
      value: formatPercentage(metrics.nrr),
      icon: TrendingUp,
      color: metrics.nrr >= 1 ? 'green' : 'orange',
      bgColor: metrics.nrr >= 1 ? 'bg-green-50' : 'bg-orange-50',
      iconColor: metrics.nrr >= 1 ? 'text-green-600' : 'text-orange-600',
      description: 'Revenue retention rate',
      badge: metrics.nrr >= 1.1 ? 'Excellent' : metrics.nrr >= 1 ? 'Good' : 'Needs Attention'
    },
    {
      title: 'Gross Revenue Retention',
      value: formatPercentage(metrics.grr),
      icon: Activity,
      color: metrics.grr >= 0.9 ? 'green' : 'orange',
      bgColor: metrics.grr >= 0.9 ? 'bg-green-50' : 'bg-orange-50',
      iconColor: metrics.grr >= 0.9 ? 'text-green-600' : 'text-orange-600',
      description: 'Gross retention rate',
    },
    {
      title: 'Customer Churn Rate',
      value: formatPercentage(metrics.churnRate),
      icon: TrendingDown,
      color: metrics.churnRate <= 0.05 ? 'green' : 'red',
      bgColor: metrics.churnRate <= 0.05 ? 'bg-green-50' : 'bg-red-50',
      iconColor: metrics.churnRate <= 0.05 ? 'text-green-600' : 'text-red-600',
      description: 'Monthly churn rate',
      badge: metrics.churnRate <= 0.03 ? 'Excellent' : metrics.churnRate <= 0.05 ? 'Good' : 'High'
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={cn('p-2 rounded-lg', card.bgColor)}>
                  <Icon className={cn('h-5 w-5', card.iconColor)} />
                </div>
                {card.badge && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs font-medium',
                      card.color === 'green' && 'bg-green-100 text-green-800',
                      card.color === 'orange' && 'bg-orange-100 text-orange-800',
                      card.color === 'red' && 'bg-red-100 text-red-800'
                    )}
                  >
                    {card.badge}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  {card.title}
                </h3>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </span>
                  
                  {card.change !== null && card.change !== undefined && (
                    <div className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      card.change > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {card.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{Math.abs(card.change).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500">
                  {card.description}
                  {card.change !== null && card.change !== undefined && (
                    <span className="ml-1">• vs last month</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
