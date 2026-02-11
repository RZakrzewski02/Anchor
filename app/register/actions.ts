'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  // 1. Walidacja obecności imienia i nazwiska
  if (!firstName || !lastName) {
    return redirect('/register?error=Imię i nazwisko są wymagane')
  }

  // 2. Walidacja zgodności haseł
  if (password !== confirmPassword) {
    return redirect('/register?error=Hasła nie są identyczne')
  }

  // 3. Rejestracja w Supabase z metadanymi
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // DANE METADATA - to tutaj ląduje imię i nazwisko
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/register?success=true')
}