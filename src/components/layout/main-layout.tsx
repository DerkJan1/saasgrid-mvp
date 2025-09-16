// Main Layout component inspired by MekuHQ/saasboard (MIT License)
// Professional layout structure with topbar and sidebar

'use client'

import { ModernSidebar } from './modern-sidebar'
import { Topbar } from './topbar'

interface MainLayoutProps {
  children: React.ReactNode
  user?: {
    email?: string
    name?: string
  } | null
}

export function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <ModernSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar user={user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
