'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    const errorMsg = encodeURIComponent('Hasła nie są identyczne')
    return redirect(`/auth/reset-password?error=${errorMsg}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const errorMsg = encodeURIComponent('Sesja wygasła. Poproś o nowy link do resetowania hasła.')
    return redirect(`/login?error=${errorMsg}`)
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    const errorMsg = encodeURIComponent(error.message)
    return redirect(`/auth/reset-password?error=${errorMsg}`)
  }

  await supabase.auth.signOut()
  
  const successMsg = encodeURIComponent('Hasło zostało zmienione. Możesz się teraz zalogować.')
  return redirect(`/login?message=${successMsg}`)
}