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
  Activity,
  PieChart,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
  Star,
  Database,
  FileText,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboards'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const dashboardItems = [
    { 
      name: 'Executive Summary', 
      href: '/', 
      icon: BarChart3,
      description: 'High-level metrics overview'
    },
    { 
      name: 'Customer Success', 
      href: '/customer-success', 
      icon: Users,
      description: 'Retention and growth analysis'
    },
    { 
      name: 'Revenue Analytics', 
      href: '/revenue', 
      icon: DollarSign,
      description: 'Detailed revenue breakdown'
    },
    { 
      name: 'Growth Metrics', 
      href: '/growth', 
      icon: TrendingUp,
      description: 'Acquisition and expansion'
    }
  ]

  const reportItems = [
    { name: 'Summary KPI', href: '/reports/summary', icon: Target },
    { name: 'Detailed KPI', href: '/reports/detailed', icon: Activity },
    { name: 'Cohort Analysis', href: '/reports/cohorts', icon: PieChart },
    { name: 'Customer List', href: '/reports/customers', icon: Users }
  ]

  const dataItems = [
    { name: 'Upload Data', href: '/upload', icon: Database },
    { name: 'Data Sources', href: '/data-sources', icon: FileText }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className={`bg-white border-r border-gray-200 ${className}`}>
      {/* Logo and Company */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">SaaSGrid</div>
            <div className="text-xs text-gray-500">Analytics Platform</div>
          </div>
        </div>
        
        {/* Company Selector */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-sm">Demo Company</span>
            <Badge variant="secondary" className="text-xs">Active</Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {/* Home */}
        <Link href="/">
          <Button
            variant={isActive('/') ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 h-10"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>

        {/* Dashboards Section */}
        <div className="mt-6">
          <button
            onClick={() => toggleSection('dashboards')}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              DASHBOARDS
            </span>
            {expandedSections.includes('dashboards') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.includes('dashboards') && (
            <div className="ml-6 mt-1 space-y-1">
              {dashboardItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3 h-9 text-sm"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reports Section */}
        <div className="mt-6">
          <button
            onClick={() => toggleSection('reports')}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              REPORTS
            </span>
            {expandedSections.includes('reports') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.includes('reports') && (
            <div className="ml-6 mt-1 space-y-1">
              {reportItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3 h-9 text-sm"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Data Section */}
        <div className="mt-6">
          <button
            onClick={() => toggleSection('data')}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              DATA
            </span>
            {expandedSections.includes('data') ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.includes('data') && (
            <div className="ml-6 mt-1 space-y-1">
              {dataItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3 h-9 text-sm"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <Link href="/settings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}
