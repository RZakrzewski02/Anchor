'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  // Tworzymy klienta zgodnie z Twoim plikiem server.ts
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // 1. Walidacja haseł z bezpiecznym kodowaniem błędu
  if (password !== confirmPassword) {
    const errorMsg = encodeURIComponent('Hasła nie są identyczne')
    return redirect(`/auth/reset-password?error=${errorMsg}`)
  }

  // 2. Sprawdzenie, czy sesja istnieje (rozwiązuje błąd "Auth session missing")
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const errorMsg = encodeURIComponent('Sesja wygasła. Poproś o nowy link do resetowania hasła.')
    return redirect(`/login?error=${errorMsg}`)
  }

  // 3. Aktualizacja hasła
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  // 4. Obsługa błędów z bazy danych
  if (error) {
    // Kodujemy wiadomość z błędem, aby uniknąć ERR_INVALID_CHAR
    const errorMsg = encodeURIComponent(error.message)
    return redirect(`/auth/reset-password?error=${errorMsg}`)
  }

  // 5. Sukces - wylogowanie i powrót do logowania
  await supabase.auth.signOut()
  
  const successMsg = encodeURIComponent('Hasło zostało zmienione. Możesz się teraz zalogować.')
  return redirect(`/login?message=${successMsg}`)
}