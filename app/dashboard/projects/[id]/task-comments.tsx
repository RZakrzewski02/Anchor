'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Reply, Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react'
import { addComment } from './comment-actions'

export default function TaskComments({ taskId, currentUserId }: { taskId: string, currentUserId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Nowy stan błędu
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const supabase = createClient()

  const fetchComments = async () => {
    setError(null)
    console.log("Pobieranie komentarzy dla zadania:", taskId)

    try {
      // 1. Pobranie komentarzy
      const { data, error: fetchError } = await supabase
        .from('task_comments')
        .select(`
          id,
          content,
          created_at,
          parent_id,
          user_id,
          profiles (
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })
      
      if (fetchError) {
        console.error("Supabase Error:", fetchError)
        throw new Error(fetchError.message)
      }

      console.log("Pobrane dane:", data) // Zobacz w konsoli (F12) co przyszło

      if (data) {
        // Normalizacja: upewniamy się, że profiles to obiekt, a nie tablica
        const normalized = data.map((item: any) => ({
          ...item,
          profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
        }))
        setComments(normalized)
      }
    } catch (err: any) {
      console.error("Błąd krytyczny:", err)
      setError(err.message || "Wystąpił błąd")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()

    const channel = supabase.channel('realtime-comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_comments' }, 
      () => fetchComments())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [taskId])

  const handleSend = async (parentId: string | null = null) => {
    if (!newComment.trim()) return
    setIsSending(true)
    
    // Używamy Server Action do zapisu
    const result = await addComment(taskId, newComment, parentId)
    
    if (result?.error) {
      alert("Błąd wysyłania: " + result.error)
    } else {
      setNewComment('')
      setReplyingTo(null)
      // Wymuszamy odświeżenie po chwili
      setTimeout(fetchComments, 500)
    }
    setIsSending(false)
  }

  const renderComment = (comment: any, isReply = false) => {
    const isOwner = comment.user_id === currentUserId
    const profile = comment.profiles
    const authorName = profile?.full_name || profile?.email || 'Użytkownik'
    const avatarUrl = profile?.avatar_url

    return (
      <div key={comment.id} className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : 'mt-4'}`}>
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <User size={14} className="text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`p-3 rounded-2xl rounded-tl-none text-sm border shadow-sm ${
            isOwner ? 'bg-blue-50/60 border-blue-100' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`font-bold text-xs ${isOwner ? 'text-blue-700' : 'text-slate-700'}`}>
                {authorName}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap wrap-break-word">{comment.content}</p>
          </div>

          {!isReply && (
            <button 
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="mt-1 ml-1 text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Reply size={12} /> Odpowiedz
            </button>
          )}

          {replyingTo === comment.id && (
            <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-1">
              <input 
                autoFocus
                type="text" 
                placeholder={`Odpowiedź...`} 
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(comment.id)}
              />
              <button onClick={() => handleSend(comment.id)} disabled={isSending} className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const rootComments = comments.filter(c => !c.parent_id)
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId)

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm mt-4">
        <AlertCircle size={16} />
        <span>Błąd: {error}. Sprawdź konsolę (F12).</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1 pb-20 min-h-75">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <MessageSquare className="mx-auto mb-2 text-slate-300" size={32} />
            <p className="text-sm font-medium text-slate-500">Brak komentarzy</p>
          </div>
        ) : (
          rootComments.map(root => (
            <div key={root.id}>
              {renderComment(root)}
              {getReplies(root.id).map(reply => renderComment(reply, true))}
            </div>
          ))
        )}
      </div>

      {!replyingTo && (
        <div className="pt-3 mt-auto bg-white border-t border-slate-100 sticky bottom-0 z-10">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Napisz komentarz..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isSending || !newComment.trim()}
              className="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}