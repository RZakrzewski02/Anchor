'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, ChevronLeft, UserX, AlertTriangle, X, Loader2 } from 'lucide-react'
import { sendMessage, removeFriend } from './friends-actions'
import { usePresence } from './presence-provider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ChatWindow({ 
  messages: initialMessages,
  currentUserId, 
  friendId, 
  friendName,
  friendAvatar
}: any) {
  const [chatMessages, setChatMessages] = useState(initialMessages)
  const [inputValue, setInputValue] = useState('')
  
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()
  
  const { isUserOnline } = usePresence()
  const isOnline = isUserOnline(friendId)

  useEffect(() => {
    setChatMessages(initialMessages)
  }, [initialMessages, friendId])

  useEffect(() => {
    const channel = supabase
      .channel(`chat_${friendId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          table: 'direct_messages',
        },
        (payload: any) => {
          const newMsg = payload.new;

          const isFromThisChat = 
            (newMsg.sender_id === friendId && newMsg.receiver_id === currentUserId) ||
            (newMsg.sender_id === currentUserId && newMsg.receiver_id === friendId);

          if (isFromThisChat) {
            setChatMessages((prev: any) => {
              if (prev.find((m: any) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            if (newMsg.receiver_id === currentUserId) {
              supabase.from('direct_messages').update({ is_read: true }).eq('id', newMsg.id).then();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [friendId, currentUserId, supabase]);

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const content = inputValue
    setInputValue('')
    
    await sendMessage(friendId, content)
  }

  const handleRemoveFriend = async () => {
    setIsRemoving(true)
    const result = await removeFriend(friendId)
    setIsRemoving(false)
    
    if (result?.error) {
      alert("Błąd: " + result.error)
    } else {
      setShowRemoveModal(false)
      router.push('/dashboard/friends')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Link 
            href="/dashboard/friends" 
            className="text-slate-500 hover:bg-slate-100 p-1.5 rounded-full transition-colors md:hidden"
          >
            <ChevronLeft size={24} />
          </Link>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            {friendAvatar ? (
              <img src={friendAvatar} className="w-full h-full object-cover" alt={friendName} />
            ) : (
              <User size={16} />
            )}
          </div>
          
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 text-sm truncate">{friendName}</h2>
            <div className="flex items-center gap-1.5">
               <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
               <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                 {isOnline ? 'Dostępny' : 'Niedostępny'}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-4">
          <Link 
            href={`/dashboard/users/${friendId}`}
            title="Profil użytkownika"
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
          >
            <User size={18} />
          </Link>
          <button 
            onClick={() => setShowRemoveModal(true)}
            title="Usuń ze znajomych"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
          >
            <UserX size={18} />
          </button>
        </div>
      </div>

      {/* LISTA WIADOMOŚCI */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-white/50">
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic">
            <p>To początek waszej rozmowy.</p>
          </div>
        )}
        {chatMessages.map((msg: any) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className="flex flex-col space-y-1">
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">
                  {formatMessageDate(msg.created_at)}
                </span>
              </div>

              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-200 shrink-0 pb-safe">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <textarea 
            rows={1}
            className="flex-1 text-slate-900 bg-white border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2 outline-none transition-all text-sm placeholder:text-slate-400 resize-none max-h-32"
            placeholder="Napisz wiadomość..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative overflow-hidden text-slate-900">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-red-50/50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} /> Usuń znajomego
              </h3>
              <button 
                onClick={() => setShowRemoveModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Czy na pewno chcesz usunąć użytkownika <span className="font-bold text-slate-900">{friendName}</span> ze swojej listy znajomych? <br/><br/>
                Stracisz możliwość bezpośredniego wysyłania do niego wiadomości. Twoja historia czatu pozostanie zachowana w bazie.
              </p>

              <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowRemoveModal(false)} 
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleRemoveFriend}
                  disabled={isRemoving} 
                  className="flex-2 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRemoving ? <Loader2 size={18} className="animate-spin" /> : <UserX size={18} />}
                  {isRemoving ? 'Usuwanie...' : 'Tak, usuń znajomego'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}