'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/app/dashboard/notification-actions'
import { markAsRead } from '../notification-actions'

export async function searchUsers(query: string) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser || !query.trim()) return []

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .ilike('full_name', `%${query}%`)
    .neq('id', currentUser.id)
    .limit(5)

  return users || []
}

export async function sendFriendRequest(targetId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('friendships')
    .select('id')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${user.id})`)
    .single()

  if (existing) return 

  const { error } = await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id: targetId,
    status: 'pending'
  })

  if (!error) {
    await createNotification(
      targetId,        
      'friend_req',     
      user.id,          
      'profile',        
      { 
        full_name: user.user_metadata.full_name || user.email
      }
    )
  }

  revalidatePath('/dashboard/friends')
}

export async function acceptFriendRequest(friendshipId: string) {
  const supabase = await createClient()
  await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
  revalidatePath('/dashboard/friends')
}

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

  await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('requester_id', senderId)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  await markAsRead(notificationId)

  revalidatePath('/dashboard/friends')
  revalidatePath('/dashboard/notifications')
}

export async function declineFriendRequestFromNotification(senderId: string, notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('friendships')
    .delete()
    .eq('requester_id', senderId)
    .eq('addressee_id', user.id)
    .eq('status', 'pending')

  await markAsRead(notificationId)

  revalidatePath('/dashboard/friends')
  revalidatePath('/dashboard/notifications')
}

export async function removeFriend(friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Brak autoryzacji' }

  await createNotification(
    friendId, 
    'friend_removed', 
    user.id, 
    'profile',
    { message: 'Ten użytkownik usunął Cię ze swojej listy znajomych.' }
  )

  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/friends')
  
  return { success: true }
}