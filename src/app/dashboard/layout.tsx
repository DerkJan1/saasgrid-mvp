import { redirect } from 'next/navigation'
import { createReadOnlyClient } from '@/lib/supabase/server'
import { MainLayout } from '@/components/layout/main-layout'

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
    <MainLayout user={user}>
      {children}
    </MainLayout>
  )
}
