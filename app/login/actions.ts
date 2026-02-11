'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  // Inicjalizacja klienta serwerowego z Twojego pliku server.ts
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Logowanie za pomocą adresu e-mail i hasła
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Obsługa błędów (np. nieprawidłowe dane logowania)
  if (error) {
    return redirect(`/login?error=${encodeURIComponent('Nieprawidłowy email lub hasło')}`)
  }

  // Po sukcesie przekierowujemy na stronę główną lub dashboard
  redirect('/dashboard')
}