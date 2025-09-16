import { redirect } from 'next/navigation'
import { createReadOnlyClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { UserNav } from '@/components/dashboard/user-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createReadOnlyClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SaaSGrid-Style Sidebar */}
      <Sidebar className="w-64 relative" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <UserNav user={user} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
