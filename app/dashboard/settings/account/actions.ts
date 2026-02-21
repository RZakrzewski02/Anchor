'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateName(formData: FormData) {
  const supabase = await createClient()
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nie jesteś zalogowany' }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      first_name: firstName, 
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim() 
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings/account')
  return { success: 'Dane zostały zaktualizowane' }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const oldPassword = formData.get('oldPassword') as string
  const newPassword = formData.get('newPassword') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) return { error: 'Błąd autoryzacji' }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  })

  if (signInError) return { error: 'Stare hasło jest nieprawidłowe' }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) return { error: updateError.message }

  return { success: 'Hasło zostało zmienione' }
}