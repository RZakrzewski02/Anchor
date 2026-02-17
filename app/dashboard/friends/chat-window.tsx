'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, ChevronLeft } from 'lucide-react' // Dodano ChevronLeft
import { sendMessage } from './friends-actions'
import { usePresence } from './presence-provider'
import Link from 'next/link' // Dodano Link do nawigacji

export default function ChatWindow({ 
  messages, 
  currentUserId, 
  friendId, 
  friendName,
  friendAvatar
}: any) {
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  
  const { isUserOnline } = usePresence()
  const isOnline = isUserOnline(friendId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const content = inputValue
    setInputValue('')
    
    await sendMessage(friendId, content)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Nagłówek czatu */}
      <div className="p-3 border-b border-slate-200 flex items-center gap-2 md:gap-3 bg-white shadow-sm z-10 shrink-0">
        
        {/* PRZYCISK WSTECZ: Widoczny tylko na małych ekranach (md:hidden) */}
        <Link 
          href="/dashboard/friends" 
          className=" text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
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
             <span className="text-[10px] text-slate-500">
               {isOnline ? 'Dostępny' : 'Niedostępny'}
             </span>
          </div>
        </div>
      </div>

      {/* Lista wiadomości */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic">
            <p>To początek waszej rozmowy.</p>
          </div>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Pole wpisywania - poprawione paddingi dla mobile */}
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
            className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}