'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/app/dashboard/notification-actions'
import { markAsRead } from '../notification-actions'

// 1. Wyszukiwanie użytkowników (do dodania)
export async function searchUsers(query: string) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser || !query.trim()) return []

  // Szukamy w profilach po imieniu/nazwisku
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .ilike('full_name', `%${query}%`)
    .neq('id', currentUser.id) // Nie szukaj siebie
    .limit(5)

  return users || []
}

// 2. Wysyłanie zaproszenia
export async function sendFriendRequest(targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Sprawdzamy, czy zaproszenie już istnieje (opcjonalne, ale dobra praktyka)
  const { data: existing } = await supabase
    .from('friendships')
    .select('id')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${user.id})`)
    .single()

  if (existing) return // Już są znajomymi lub zaproszenie wisi

  // 2. Wstawiamy relację znajomości
  const { error } = await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id: targetId,
    status: 'pending'
  })

  if (!error) {
    // 3. WYSYŁAMY POWIADOMIENIE
    // resourceId to ID osoby wysyłającej (żeby po kliknięciu przejść do jej profilu lub czatu)
    await createNotification(
      targetId,         // Do kogo (adresat zaproszenia)
      'friend_req',     // Nowy typ powiadomienia
      user.id,          // Zasób: ID osoby wysyłającej
      'profile',        // Typ zasobu
      { 
        full_name: user.user_metadata.full_name || user.email // Dodatkowe dane do wyświetlenia
      }
    )
  }

  revalidatePath('/dashboard/friends')
}

// 3. Akceptacja zaproszenia
export async function acceptFriendRequest(friendshipId: string) {
  const supabase = await createClient()
  await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
  revalidatePath('/dashboard/friends')
}

// 4. Wysyłanie wiadomości
export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !content.trim()) return

  await supabase.from('direct_messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content
  })
  revalidatePath(`/dashboard/friends`)
}

export async function acceptFriendRequestFromNotification(senderId: string, notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. Aktualizujemy status w tabeli friendships
  // Szukamy rekordu gdzie requester to nadawca powiadomienia, a addressee to my
  await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('requester_id', senderId)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  // 2. Oznaczamy powiadomienie jako przeczytane
  await markAsRead(notificationId)

  revalidatePath('/dashboard/friends')
  revalidatePath('/dashboard/notifications')
}

// NOWE: Odrzucenie zaproszenia bezpośrednio z powiadomienia
export async function declineFriendRequestFromNotification(senderId: string, notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. Usuwamy rekord z tabeli friendships
  await supabase
    .from('friendships')
    .delete()
    .eq('requester_id', senderId)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  // 2. Oznaczamy powiadomienie jako przeczytane (lub usuwamy)
  await markAsRead(notificationId)

  revalidatePath('/dashboard/friends')
  revalidatePath('/dashboard/notifications')
}