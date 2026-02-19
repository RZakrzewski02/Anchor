'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Tworzenie powiadomienia
export async function createNotification(
  userId: string, 
  type: 'comment' | 'reply' | 'assignment' | 'invitation' | 'friend_req' | 'friend_removed', 
  resourceId: string, 
  resourceType: 'task' | 'project' | 'profile' | 'friendship',
  metaData: any = {}
) {
  const supabase = await createClient()
  
  // Sprawdzamy, kto wysyła
  const { data: { user: actor } } = await supabase.auth.getUser()
  if (!actor) {
    console.error("BŁĄD POWIADOMIENIA: Brak zalogowanego użytkownika (aktora)")
    return
  }

  // Logika: nie wysyłaj do samego siebie
  if (userId === actor.id) {
    console.log("Pominięto powiadomienie do samego siebie")
    return
  }

  console.log(`Próba wysłania powiadomienia od ${actor.email} do ${userId} (typ: ${type})...`)

  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    actor_id: actor.id,
    type,
    resource_id: resourceId,
    resource_type: resourceType,
    meta_data: metaData
  })

  if (error) {
    console.error("BŁĄD SUPABASE PRZY WYSYŁANIU:", error.message, error.details)
  } else {
    console.log("SUKCES! Powiadomienie zapisane w bazie.")
  }
}

// 2. Akceptacja zaproszenia do PROJEKTU
export async function acceptInvitation(notificationId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase
    .from('project_members')
    .update({ status: 'active' })
    .eq('project_id', projectId)
    .eq('user_id', user?.id)

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/projects')
}

// 3. Odrzucenie zaproszenia do PROJEKTU
export async function declineInvitation(notificationId: string, projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  await supabase.from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', user?.id)

  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  
  revalidatePath('/dashboard')
}

// 4. Oznaczenie jako przeczytane
export async function markAsRead(notificationId: string) {
  const supabase = await createClient()
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  revalidatePath('/dashboard/notifications')
}

// 5. Usuwanie powiadomienia
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()
  
  await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
  
  revalidatePath('/dashboard/notifications')
}