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

  // 2. ZBIERAMY ID OSÓB
  const friendIds = friendships.map(f => 
    f.requester_id === user.id ? f.addressee_id : f.requester_id
  )

  // 3. POBIERAMY PROFILE
  let profilesMap: Record<string, any> = {}
  
  if (friendIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', friendIds)
    
    profiles?.forEach(p => {
      profilesMap[p.id] = p
    })
  }

  // 4. ŁĄCZYMY DANE
  const friends = friendships.map(f => {
    const isMeRequester = f.requester_id === user.id
    const friendId = isMeRequester ? f.addressee_id : f.requester_id
    const profile = profilesMap[friendId]

    return {
      friendshipId: f.id,
      status: f.status,
      id: friendId,
      full_name: profile?.full_name || 'Nieznany Użytkownik',
      avatar_url: profile?.avatar_url,
      isMyRequest: isMeRequester
    }
  })

  const acceptedFriends = friends.filter(f => f.status === 'accepted')
  const pendingRequests = friends.filter(f => f.status === 'pending' && !f.isMyRequest)

  // 5. POBIERAMY WIADOMOŚCI
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
    }
  }

  // Logika widoczności dla mobile
  const isChatOpen = !!searchParams.chatWith

  return (
    <div className="flex h-full bg-white">
      
      {/* LEWA STRONA: Lista znajomych */}
      {/* Na mobile: ukryta gdy czat jest otwarty (hidden), widoczna gdy czat zamknięty (flex) */}
      <div className={`
        ${isChatOpen ? 'hidden md:flex' : 'flex'} 
        w-full md:w-80 border-r border-slate-200 flex-col bg-slate-50 shrink-0 h-full pt-16 md:pt-0
      `}>
        <div className="p-4 border-b border-slate-200 bg-white">
          <h1 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <UserPlus className="text-blue-600" size={20} /> Znajomi
          </h1>
          <FriendsList 
            currentUserId={user.id} 
            existingFriendIds={friends.map(f => f.id)} 
          />
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
                       {req.avatar_url ? (
                         <img src={req.avatar_url} className="w-full h-full object-cover" alt="" />
                       ) : (
                         <User size={14} />
                       )}
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">{req.full_name}</span>
                  </div>
                  <form action={async () => { 'use server'; await acceptFriendRequest(req.friendshipId) }}>
                     <button className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 font-bold transition-colors">
                        Akceptuj
                     </button>
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
              <AvatarWithStatus 
                userId={friend.id}
                avatarUrl={friend.avatar_url}
                fullName={friend.full_name}
                isActiveChat={searchParams.chatWith === friend.id}
              />
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold truncate text-sm ${searchParams.chatWith === friend.id ? 'text-white' : 'text-slate-800'}`}>{friend.full_name}</h3>
                <p className={`text-[10px] truncate ${searchParams.chatWith === friend.id ? 'text-blue-200' : 'text-slate-400'}`}>Kliknij, aby napisać...</p>
              </div>
            </a>
          )) : (
            <div className="text-center py-8 px-4 text-slate-400 text-xs italic">
              Brak znajomych.
            </div>
          )}
        </div>
      </div>

      {/* PRAWA STRONA: Okno czatu */}
      <div className={`
        ${isChatOpen ? 'fixed inset-0 z-50 md:relative md:inset-auto md:flex' : 'hidden md:flex'} 
        flex-1 flex-col bg-white md:bg-slate-50 h-full overflow-hidden
      `}>
        {activeFriend ? (
          <ChatWindow 
            messages={messages} 
            currentUserId={user.id} 
            friendId={activeFriend.id} 
            friendName={activeFriend.full_name}
            friendAvatar={activeFriend.avatar_url}
          />
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