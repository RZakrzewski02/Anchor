import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/app/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar userEmail={user?.email} />
      <main className="flex-1 flex flex-col pt-16 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}