import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/app/dashboard/sidebar'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // 1. Sprawdzamy sesję użytkownika
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Pobieramy DANE PROFILU (To jest kluczowe dla poprawnego wyświetlania)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*') // Pobieramy wszystko: first_name, last_name, avatar_url, full_name
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Przekazujemy pobrany profil do Sidebaru */}
      <Sidebar userEmail={user.email} userProfile={profile} />
      
      <main className="flex-1 overflow-y-auto h-full bg-slate-50">
        {children}
      </main>
    </div>
  )
}