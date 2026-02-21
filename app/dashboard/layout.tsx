import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/app/dashboard/sidebar'
import { redirect } from 'next/navigation'
import PresenceProvider from './friends/presence-provider'
import RealtimeNotificationsListener from './notifications-listener'
export const dynamic = 'force-dynamic' 

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {user && <RealtimeNotificationsListener userId={user.id} />}
      <PresenceProvider user={user}>
        <Sidebar 
          userEmail={user.email} 
          userProfile={profile} 
          unreadCount={count || 0} 
        />
        <main className="flex-1 overflow-y-auto h-full bg-slate-50">
          {children}
        </main>
      </PresenceProvider>
    </div>
  )
}