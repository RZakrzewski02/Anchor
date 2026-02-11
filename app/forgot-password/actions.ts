'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Adres, na który użytkownik zostanie przekierowany po kliknięciu w link w mailu
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  })

  if (error) {
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  // Przekierowanie z informacją o sukcesie
  return redirect('/forgot-password?success=true')
}