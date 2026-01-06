'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  // Inicjalizacja klienta serwerowego Supabase z Twojego pliku server.ts
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Walidacja zgodności haseł
  if (password !== confirmPassword) {
    return redirect('/register?error=Hasła nie są identyczne')
  }

  // Rejestracja w Supabase
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Ustawienie adresu powrotnego po potwierdzeniu e-mail
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  // Obsługa błędów rejestracji
  if (error) {
    return redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // Przekierowanie do widoku sukcesu
  return redirect('/register?success=true')
}