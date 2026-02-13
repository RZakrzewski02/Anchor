import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountForm from './account-form'
import PasswordForm from './password-form'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Pobieramy aktualne dane, aby wypełnić formularz
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ustawienia Konta</h1>
        <p className="text-slate-500 text-sm">Zarządzaj swoimi danymi i bezpieczeństwem.</p>
      </div>

      {/* SEKCJA: DANE OSOBOWE */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Dane osobowe</h2>
        <AccountForm 
          initialFirstName={profile?.first_name || ''} 
          initialLastName={profile?.last_name || ''} 
        />
      </section>

      {/* SEKCJA: BEZPIECZEŃSTWO */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Zmiana hasła</h2>
        <PasswordForm />
      </section>
    </div>
  )
}