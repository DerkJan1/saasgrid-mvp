// Modern Sidebar inspired by MekuHQ/saasboard (MIT License)
// Clean, professional navigation with better organization

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText,
  Upload,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Target,
  PieChart,
  Activity,
  Database,
  Star,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ModernSidebarProps {
  className?: string
}

export function ModernSidebar({ className }: ModernSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigation = [
    {
      name: 'Overview',
      href: '/',
      icon: Home,
      current: pathname === '/',
    },
    {
      name: 'Analytics',
      href: '/analytics', 
      icon: BarChart3,
      current: pathname === '/analytics',
      badge: 'New'
    },
  ]

  const dashboards = [
    {
      name: 'Executive Summary',
      href: '/executive',
      icon: Target,
      current: pathname === '/executive',
    },
    {
      name: 'Customer Success', 
      href: '/customer-success',
      icon: Users,
      current: pathname === '/customer-success',
    },
    {
      name: 'Revenue Analytics',
      href: '/revenue',
      icon: DollarSign,
      current: pathname === '/revenue',
    },
    {
      name: 'Growth Metrics',
      href: '/growth',
      icon: TrendingUp,
      current: pathname === '/growth',
    },
  ]

  const reports = [
    {
      name: 'KPI Reports',
      href: '/reports/kpi',
      icon: Activity,
      current: pathname === '/reports/kpi',
    },
    {
      name: 'Cohort Analysis',
      href: '/reports/cohorts',
      icon: PieChart,
      current: pathname === '/reports/cohorts',
    },
    {
      name: 'Customer List',
      href: '/reports/customers',
      icon: Users,
      current: pathname === '/reports/customers',
    },
  ]

  const tools = [
    {
      name: 'Upload Data',
      href: '/upload',
      icon: Upload,
      current: pathname === '/upload',
    },
    {
      name: 'Data Sources',
      href: '/data-sources',
      icon: Database,
      current: pathname === '/data-sources',
    },
  ]

  const NavSection = ({ title, items, showTitle = true }: { 
    title: string
    items: typeof navigation
    showTitle?: boolean 
  }) => (
    <div className="space-y-1">
      {showTitle && !isCollapsed && (
        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={item.current ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 h-9',
                item.current && 'bg-blue-50 text-blue-700 hover:bg-blue-100',
                isCollapsed && 'px-2'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Logo and Company */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <div className="font-bold text-gray-900">SaaSGrid</div>
                <div className="text-xs text-gray-500">Analytics Platform</div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Company Selector */}
        {!isCollapsed && (
          <div className="mt-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 text-blue-600" />
              <span className="font-medium text-sm text-blue-900">Demo Company</span>
              <Badge variant="outline" className="ml-auto text-xs border-blue-200 text-blue-700">
                Active
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <NavSection title="Navigation" items={navigation} showTitle={false} />
        
        {/* Dashboards */}
        <NavSection title="Dashboards" items={dashboards} />
        
        {/* Reports */}
        <NavSection title="Reports" items={reports} />
        
        {/* Tools */}
        <NavSection title="Tools" items={tools} />
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link href="/help">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 h-9',
              isCollapsed && 'px-2'
            )}
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Help & Support</span>}
          </Button>
        </Link>
        
        <Link href="/settings">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 h-9',
              isCollapsed && 'px-2'
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Button>
        </Link>

        {/* Version Info */}
        {!isCollapsed && (
          <div className="pt-2 text-center">
            <div className="text-xs text-gray-400">SaaSGrid v3.0</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">Hybrid UI</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
