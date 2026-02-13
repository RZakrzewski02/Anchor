import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AvatarUpload from './avatar-upload'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Twój Profil</h1>
        <p className="text-slate-500 text-sm">Zarządzaj swoim publicznym wizerunkiem w projektach.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center">
        {/* KOMPONENT WGRYWANIA ZDJĘCIA */}
        <AvatarUpload 
          userId={user.id} 
          avatarUrl={profile?.avatar_url} 
        />

        {/* IMIĘ I NAZWISKO - Wyświetlanie pod zdjęciem */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-slate-400 text-sm">{user.email}</p>
        </div>
        
        {/* Tu w przyszłości możesz dodać formularz do edycji imienia */}
      </div>
    </div>
  )
}