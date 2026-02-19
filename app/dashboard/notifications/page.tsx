import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, MessageSquare, UserPlus, CheckCircle2, Check, X, Trash2, UserX } from 'lucide-react'
import { acceptInvitation, declineInvitation, markAsRead, deleteNotification } from '../notification-actions'
import { acceptFriendRequestFromNotification, declineFriendRequestFromNotification } from '../friends/friends-actions'
import RealtimeNotificationsListener from '../notifications-listener'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!actor_id (
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Błąd pobierania powiadomień:", error)
  }

  return (
    <div className="p-4 md:p-8 font-sans w-full h-full flex flex-col gap-8 bg-slate-50/30">
      {user && <RealtimeNotificationsListener userId={user.id} />}
      <header className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="p-3 bg-white border border-slate-200 text-blue-600 rounded-xl shadow-sm">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Powiadomienia</h1>
          <p className="text-slate-500 font-medium">Zarządzaj zaproszeniami i aktywnością.</p>
        </div>
      </header>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="p-4 bg-slate-50 rounded-full mb-3">
              <Bell className="opacity-40" size={32} />
            </div>
            <p className="font-medium">Brak nowych powiadomień.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationItem({ notification }: { notification: any }) {
  const isRead = notification.is_read
  
  const actorProfile = notification.actor
  const actorName = actorProfile?.full_name || actorProfile?.email?.split('@')[0] || 'Użytkownik'
  
  const linkHref = notification.resource_type === 'task' 
    ? `/dashboard/projects/${notification.meta_data?.project_id}` 
    : (notification.type === 'friend_req' || notification.type === 'friend_removed') 
      ? '/dashboard/friends' 
      : (notification.type === 'invitation' ? '#' : `/dashboard/projects/${notification.resource_id}`)

  const isInvitation = notification.type === 'invitation' || notification.type === 'friend_req'

  return (
    <div className={`p-4 md:p-5 rounded-xl border flex flex-col md:flex-row gap-4 transition-all items-start md:items-center ${isRead ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-blue-200 shadow-sm hover:shadow-md'}`}>
      
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
        isRead ? 'bg-slate-50 text-slate-400' : (notification.type === 'friend_removed' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600')
      }`}>
        {actorProfile?.avatar_url ? (
           <img src={actorProfile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
        ) : (
           <>
            {isInvitation && <UserPlus size={18} />}
            {(notification.type === 'comment' || notification.type === 'reply') && <MessageSquare size={18} />}
            {notification.type === 'assignment' && <CheckCircle2 size={18} />}
            {notification.type === 'friend_removed' && <UserX size={18} />} 
           </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-900 mb-1 leading-relaxed">
          <span className="font-bold text-slate-800">{actorName}</span>
          
          {notification.type === 'invitation' && <span className="text-slate-600"> zaprasza Cię do projektu <span className="font-semibold text-slate-900">"{notification.meta_data?.project_name || 'Projekt'}"</span></span>}
          {notification.type === 'friend_req' && <span className="text-slate-600"> wysłał Ci zaproszenie do grona znajomych.</span>}
          {notification.type === 'comment' && <span className="text-slate-600"> skomentował zadanie <span className="font-semibold text-slate-900">"{notification.meta_data?.task_title || 'Zadanie'}"</span></span>}
          {notification.type === 'reply' && <span className="text-slate-600"> odpowiedział na Twój komentarz w zadaniu <span className="font-semibold text-slate-900">"{notification.meta_data?.task_title || 'Zadanie'}"</span></span>}
          {notification.type === 'assignment' && <span className="text-slate-600"> przypisał Cię do zadania <span className="font-semibold text-slate-900">"{notification.meta_data?.task_title || 'Zadanie'}"</span></span>}
          {notification.type === 'friend_removed' && <span className="text-slate-600"> usunął/usunęła Cię ze swojej listy znajomych.</span>}
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {new Date(notification.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 justify-end">
        
        {/* LOGIKA PRZYCISKÓW AKCJI (ZAPROSZENIA) */}
        {isInvitation && !isRead ? (
          <div className="flex gap-2 w-full md:w-auto">
            
            {/* PRZYCISK AKCEPTUJ */}
            <form className="flex-1 md:flex-none" action={async () => { 
                'use server'; 
                if (notification.type === 'invitation') {
                    // Akceptacja projektu
                    await acceptInvitation(notification.id, notification.resource_id)
                } else {
                    // Akceptacja znajomego (resource_id tutaj to ID nadawcy!)
                    await acceptFriendRequestFromNotification(notification.resource_id, notification.id) 
                }
            }}>
              <button className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 cursor-pointer">
                <Check size={14} /> Akceptuj
              </button>
            </form>

            {/* PRZYCISK ODRZUĆ */}
            <form className="flex-1 md:flex-none" action={async () => { 
                'use server'; 
                if (notification.type === 'invitation') {
                    // Odrzucenie projektu
                    await declineInvitation(notification.id, notification.resource_id)
                } else {
                    // Odrzucenie znajomego
                    await declineFriendRequestFromNotification(notification.resource_id, notification.id)
                }
            }}>
              <button className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-red-600 hover:border-red-100 transition-colors cursor-pointer">
                <X size={14} /> Odrzuć
              </button>
            </form>
          </div>
        ) : (
          // DLA POZOSTAŁYCH TYPÓW LUB PRZECZYTANYCH - LINK
          <Link href={linkHref} className="whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors ">
              Zobacz szczegóły
          </Link>
        )}

        <div className="flex items-center gap-1 border-l border-slate-100 pl-2 ml-2">
          {/* Przycisk oznaczania jako przeczytane (dla innych typów niż zaproszenia) */}
          {!isRead && !isInvitation && (
            <form action={async () => { 'use server'; await markAsRead(notification.id) }}>
              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Oznacz jako przeczytane">
                <Check size={18} />
              </button>
            </form>
          )}

          {/* Usuwanie */}
          <form action={async () => { 'use server'; await deleteNotification(notification.id) }}>
            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Usuń powiadomienie">
              <Trash2 size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}