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
    <div className="flex min-h-screen bg-white">
      <aside className="w-64 bg-slate-900 flex flex-col">
        <Sidebar userEmail={user?.email} />
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}