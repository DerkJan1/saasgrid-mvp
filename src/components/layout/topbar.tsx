// Topbar component inspired by MekuHQ/saasboard (MIT License)
// Professional header with search, notifications, and user menu

'use client'

import { useState } from 'react'
import { Search, Bell, Settings, User, ChevronDown, Building2, Upload, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface TopbarProps {
  user?: {
    email?: string
    name?: string
  } | null
}

export function Topbar({ user }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search metrics, customers, or reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Center Section - Company Info & Quick Stats */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Demo Company</span>
          <Badge variant="secondary" className="text-xs">Active</Badge>
        </div>
        
        {/* Quick MRR Display */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
          <BarChart3 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">MRR: $0</span>
        </div>
      </div>

      {/* Right Section - Actions & User Menu */}
      <div className="flex items-center gap-3">
        {/* Quick Upload Button */}
        <Link href="/upload">
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Data
          </Button>
        </Link>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* User Menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-8 w-auto px-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {getInitials(user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {user.name || user.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
