'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteMember(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) return { error: 'Podaj adres email' }

  // Wywołanie bezpiecznej funkcji bazy danych
  const { error } = await supabase.rpc('add_member_by_email', {
    project_id: projectId,
    email: email
  })

  if (error) {
    // Np. "Nie znaleziono użytkownika" lub "Użytkownik już jest w projekcie"
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: 'Użytkownik został dodany!' }
}