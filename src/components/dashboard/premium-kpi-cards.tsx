// Premium KPI Cards - Lovable-inspired design with gradients and animations
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity, BarChart3, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumKPICardsProps {
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

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  variant: "revenue" | "growth" | "customer" | "retention" | "warning" | "danger";
  trendValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  className?: string;
}

function PremiumKPICard({ 
  title, 
  value, 
  subtitle, 
  variant, 
  trendValue, 
  icon: Icon, 
  badge,
  className 
}: KPICardProps) {
  const variantStyles = {
    revenue: {
      container: "bg-gradient-revenue text-white border-0 shadow-premium",
      icon: "bg-white/20 text-white",
      badge: "bg-white/20 text-white border-white/30"
    },
    growth: {
      container: "bg-gradient-growth text-white border-0 shadow-premium",
      icon: "bg-white/20 text-white", 
      badge: "bg-white/20 text-white border-white/30"
    },
    customer: {
      container: "bg-gradient-premium text-white border-0 shadow-premium",
      icon: "bg-white/20 text-white",
      badge: "bg-white/20 text-white border-white/30"
    },
    retention: {
      container: "bg-white border-border shadow-card hover:shadow-card-hover",
      icon: "bg-success/10 text-success",
      badge: "bg-success/10 text-success border-success/20"
    },
    warning: {
      container: "bg-white border-border shadow-card hover:shadow-card-hover",
      icon: "bg-warning/10 text-warning",
      badge: "bg-warning/10 text-warning border-warning/20"
    },
    danger: {
      container: "bg-white border-border shadow-card hover:shadow-card-hover",
      icon: "bg-danger/10 text-danger",
      badge: "bg-danger/10 text-danger border-danger/20"
    }
  };

  const styles = variantStyles[variant];
  const isGradient = ['revenue', 'growth', 'customer'].includes(variant);

  return (
    <Card className={cn(
      "transition-all duration-300 hover:-translate-y-1 group cursor-pointer",
      styles.container,
      className
    )}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl transition-transform group-hover:scale-110",
            styles.icon
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {badge && (
            <Badge 
              variant="outline" 
              className={cn("text-xs font-medium", styles.badge)}
            >
              {badge}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className={cn(
            "text-sm font-medium transition-colors",
            isGradient ? "text-white/90" : "text-gray-700"
          )}>
            {title}
          </h3>
          
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-2xl md:text-3xl font-semibold tracking-tight",
              isGradient ? "text-white" : "text-gray-900"
            )}>
              {value}
            </span>
            
            {trendValue && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isGradient ? "text-white/80" : "text-gray-600"
              )}>
                {trendValue.startsWith('+') ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className={cn(
              "text-xs",
              isGradient ? "text-white/70" : "text-gray-600"
            )}>
              {subtitle}
              {trendValue && (
                <span className="ml-1">• vs last month</span>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PremiumKPICards({ metrics, previousMetrics }: PremiumKPICardsProps) {
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
    const change = ((current - previous) / previous) * 100
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
  }

  const mrrChange = calculateChange(metrics.mrr, previousMetrics?.mrr)
  const customerChange = calculateChange(metrics.customerCount, previousMetrics?.customerCount)

  const getRetentionBadge = (value: number, threshold: number) => {
    if (value >= threshold + 0.1) return 'Excellent'
    if (value >= threshold) return 'Good'
    return 'Needs Attention'
  }

  const getChurnBadge = (value: number) => {
    if (value <= 0.03) return 'Excellent'
    if (value <= 0.05) return 'Good'
    return 'High'
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Primary Revenue Metrics - Gradient Cards */}
      <PremiumKPICard
        title="Monthly Recurring Revenue"
        value={formatCurrency(metrics.mrr)}
        subtitle="Current MRR"
        variant="revenue"
        trendValue={mrrChange}
        icon={DollarSign}
      />

      <PremiumKPICard
        title="Annual Recurring Revenue"
        value={formatCurrency(metrics.arr)}
        subtitle="Annualized revenue"
        variant="growth"
        trendValue={mrrChange}
        icon={Target}
      />

      <PremiumKPICard
        title="Active Customers"
        value={metrics.customerCount.toLocaleString()}
        subtitle="Total active customers"
        variant="customer"
        trendValue={customerChange}
        icon={Users}
      />

      {/* Secondary Metrics - White Cards with Color Accents */}
      <PremiumKPICard
        title="Net Revenue Retention"
        value={formatPercentage(metrics.nrr)}
        subtitle="Revenue retention rate"
        variant={metrics.nrr >= 1.1 ? "retention" : metrics.nrr >= 1 ? "warning" : "danger"}
        icon={TrendingUp}
        badge={getRetentionBadge(metrics.nrr, 1)}
      />

      <PremiumKPICard
        title="Gross Revenue Retention"
        value={formatPercentage(metrics.grr)}
        subtitle="Gross retention rate"
        variant={metrics.grr >= 0.9 ? "retention" : "warning"}
        icon={Activity}
        badge={getRetentionBadge(metrics.grr, 0.9)}
      />

      <PremiumKPICard
        title="Customer Churn Rate"
        value={formatPercentage(metrics.churnRate)}
        subtitle="Monthly churn rate"
        variant={metrics.churnRate <= 0.05 ? "retention" : "danger"}
        icon={TrendingDown}
        badge={getChurnBadge(metrics.churnRate)}
      />
    </div>
  )
}
