import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserPlus, MessageSquare, User } from 'lucide-react'
import FriendsList from './friends-list'
import ChatWindow from './chat-window'
import { acceptFriendRequest } from './friends-actions'
import AvatarWithStatus from './avatar-with-status'

export default async function FriendsPage(props: { searchParams: Promise<{ chatWith?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. POBIERAMY ZNAJOMOŚCI
  const { data: friendshipsRaw } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const friendships = friendshipsRaw || []
  const friendIds = friendships.map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id)

  // 2. POBIERAMY PROFILE
  let profilesMap: Record<string, any> = {}
  if (friendIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', friendIds)
    profiles?.forEach(p => { profilesMap[p.id] = p })
  }

  // 3. POBIERAMY INFORMACJE O WIADOMOŚCIACH (ostatnia wiadomość i nieprzeczytane)
  // Pobieramy ostatnie wiadomości dla wszystkich konwersacji użytkownika
  const { data: lastMessages } = await supabase
    .from('direct_messages')
    .select('sender_id, receiver_id, created_at, content')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  // Pobieramy liczbę nieprzeczytanych wiadomości dla użytkownika
  const { data: unreadCountsRaw } = await supabase
    .from('direct_messages')
    .select('sender_id')
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  // Grupowanie nieprzeczytanych wiadomości po nadawcy
  const unreadMap: Record<string, number> = {}
  unreadCountsRaw?.forEach(msg => {
    unreadMap[msg.sender_id] = (unreadMap[msg.sender_id] || 0) + 1
  })

  // 4. ŁĄCZYMY DANE I SORTUJEMY
  const friends = friendships.map(f => {
  const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id
  const profile = profilesMap[friendId]
  
  const lastMsg = lastMessages?.find(m => 
    (m.sender_id === user.id && m.receiver_id === friendId) || 
    (m.sender_id === friendId && m.receiver_id === user.id)
  )

  return {
    friendshipId: f.id,
    status: f.status,
    id: friendId,
    full_name: profile?.full_name || 'Nieznany Użytkownik',
    avatar_url: profile?.avatar_url,
    isMyRequest: f.requester_id === user.id,
    lastMessageAt: lastMsg ? new Date(lastMsg.created_at).getTime() : 0,
    unreadCount: (searchParams.chatWith === friendId) ? 0 : (unreadMap[friendId] || 0)
  }
})

  // Sortowanie: osoby z najnowszą wiadomością na górze
  const acceptedFriends = friends
    .filter(f => f.status === 'accepted')
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt)

  const pendingRequests = friends.filter(f => f.status === 'pending' && !f.isMyRequest)

  // 5. POBIERAMY WIADOMOŚCI DLA AKTYWNEGO CZATU
  let messages = []
  let activeFriend = null
  if (searchParams.chatWith) {
    activeFriend = acceptedFriends.find(f => f.id === searchParams.chatWith)
    if (activeFriend) {
      const { data: msgs } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeFriend.id}),and(sender_id.eq.${activeFriend.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
      messages = msgs || []

      // OPCJONALNIE: Oznaczanie jako przeczytane po otwarciu czatu
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', activeFriend.id)
        .eq('receiver_id', user.id)
        .eq('is_read', false)
    }
  }

  const isChatOpen = !!searchParams.chatWith

  return (
    <div className="flex h-full bg-white overflow-hidden shadow-sm relative">
      <div className={`${isChatOpen ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 flex-col bg-slate-50 shrink-0 h-full pt-16 md:pt-0`}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h1 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserPlus className="text-blue-600" size={20} /> Znajomi
          </h1>
          <FriendsList currentUserId={user.id} existingFriendIds={friends.map(f => f.id)} />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {/* ZAPROSZENIA */}
          {pendingRequests.length > 0 && (
            <div className="mb-4">
              <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Zaproszenia</p>
              {pendingRequests.map(req => (
                <div key={req.id} className="p-2 bg-white border border-orange-200 rounded-lg flex items-center justify-between shadow-sm mb-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-orange-100 text-orange-600 font-bold text-[10px] border border-orange-200">
                       {req.avatar_url ? <img src={req.avatar_url} className="w-full h-full object-cover" alt="" /> : <User size={12} />}
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">{req.full_name}</span>
                  </div>
                  <form action={async () => { 'use server'; await acceptFriendRequest(req.friendshipId) }}>
                     <button className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 font-bold transition-colors">Akceptuj</button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {/* LISTA ZNAJOMYCH */}
          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Znajomi ({acceptedFriends.length})</p>
          {acceptedFriends.length > 0 ? acceptedFriends.map(friend => (
            <a 
              key={friend.id} 
              href={`/dashboard/friends?chatWith=${friend.id}`}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${searchParams.chatWith === friend.id ? 'bg-blue-600 shadow-md ring-1 ring-blue-400' : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'}`}
            >
              <AvatarWithStatus userId={friend.id} avatarUrl={friend.avatar_url} fullName={friend.full_name} isActiveChat={searchParams.chatWith === friend.id} />
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className={`font-bold truncate text-sm ${searchParams.chatWith === friend.id ? 'text-white' : 'text-slate-800'}`}>{friend.full_name}</h3>
                  
                  {/* POWIADOMIENIE O NIEPRZECZYTANYCH */}
                  {friend.unreadCount > 0 && searchParams.chatWith !== friend.id && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
                      {friend.unreadCount}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] truncate ${searchParams.chatWith === friend.id ? 'text-blue-200' : 'text-slate-400'}`}>
                  {friend.unreadCount > 0 && searchParams.chatWith !== friend.id ? 'Nowa wiadomość...' : ''}
                </p>
              </div>
            </a>
          )) : (
            <div className="text-center py-8 px-4 text-slate-400 text-xs italic">Brak znajomych.</div>
          )}
        </div>
      </div>

      <div className={`
        ${isChatOpen ? 'fixed inset-0 z-50 md:relative md:inset-auto md:flex' : 'hidden md:flex'} 
        flex-1 flex-col bg-white md:bg-slate-50 h-full overflow-hidden
      `}>
        {activeFriend ? (
          <div className="h-full">
            <ChatWindow 
              messages={messages} 
              currentUserId={user.id} 
              friendId={activeFriend.id} 
              friendName={activeFriend.full_name}
              friendAvatar={activeFriend.avatar_url}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-300">
            <MessageSquare size={48} className="mb-4 opacity-40" />
            <p className="text-sm font-medium">Wybierz znajomego, aby rozpocząć czat</p>
          </div>
        )}
      </div>
    </div>
  )
}