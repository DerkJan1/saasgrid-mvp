import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h2>
          <p className="text-gray-600 mt-2">
            Deep dive into your SaaS metrics and performance trends.
          </p>
        </div>
        <Badge variant="secondary">Coming Soon</Badge>
      </div>

      {/* Placeholder Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              Detailed revenue breakdown and forecasting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-2">
              <TrendingUp className="h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium">Advanced Revenue Analytics</p>
              <p className="text-sm text-center">
                Revenue forecasting, cohort analysis, and advanced metrics coming soon.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Customer Analytics
            </CardTitle>
            <CardDescription>
              Customer behavior and retention insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-2">
              <Users className="h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium">Customer Insights</p>
              <p className="text-sm text-center">
                Customer segmentation, lifetime value, and behavior analysis coming soon.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Metrics
            </CardTitle>
            <CardDescription>
              Advanced financial calculations and ratios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-2">
              <DollarSign className="h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium">Financial Analysis</p>
              <p className="text-sm text-center">
                LTV:CAC ratios, unit economics, and financial modeling coming soon.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Performance Tracking
            </CardTitle>
            <CardDescription>
              Goal tracking and performance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 space-y-2">
              <Activity className="h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium">Performance Monitoring</p>
              <p className="text-sm text-center">
                Goal setting, alerts, and performance dashboards coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Analytics Features</CardTitle>
          <CardDescription>
            These advanced analytics features will be available in future updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Revenue Analytics</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Revenue forecasting & predictions</li>
                <li>• Cohort analysis by acquisition month</li>
                <li>• Revenue waterfall charts</li>
                <li>• Seasonal trend analysis</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Customer Analytics</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Customer lifetime value (LTV)</li>
                <li>• Churn prediction models</li>
                <li>• Customer segmentation</li>
                <li>• Usage & engagement metrics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
