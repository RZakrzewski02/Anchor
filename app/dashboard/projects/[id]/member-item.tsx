'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { User, Trash2, Loader2, ChevronRight, X, AlertTriangle } from 'lucide-react'
import { removeMember } from './member-actions'
import Link from 'next/link'
import { usePresence } from '../../friends/presence-provider'

interface MemberItemProps {
  userId: string;
  role: string;
  isCurrentUser: boolean;
  profiles: {
    id?: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  viewerIsManager: boolean;
  projectId: string;
}

export default function MemberItem({ 
  userId, 
  role, 
  isCurrentUser, 
  profiles, 
  viewerIsManager,
  projectId
}: MemberItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const { isUserOnline } = usePresence()
  const isOnline = isUserOnline(userId)
  
  const displayName = isCurrentUser 
    ? "Ty" 
    : (profiles?.full_name || 
       (profiles?.first_name ? `${profiles.first_name} ${profiles.last_name || ''}`.trim() : null) || 
       "Użytkownik");

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowModal(true)
  }

  const confirmRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsRemoving(true)
    const result = await removeMember(projectId, userId)
    
    if (result?.error) {
      alert("Błąd podczas usuwania: " + result.error)
      setIsRemoving(false)
      setShowModal(false)
    }
  }

  return (
    <>
      <Link 
        href={isCurrentUser ? "/dashboard/settings/profile" : `/dashboard/users/${userId}`}
        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm overflow-hidden ${
              isCurrentUser ? 'border-blue-200' : 'border-slate-100'
            }`}>
              {profiles?.avatar_url ? (
                <img src={profiles.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <User size={18} />
                </div>
              )}
            </div>
            
            <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full transition-colors duration-300 ${
              isOnline ? 'bg-green-500' : 'bg-slate-300'
            }`} />
          </div>

          <div className="truncate">
            <p className="text-sm font-bold text-slate-900 truncate leading-tight">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {role === 'manager' ? 'Kierownik' : 'Członek'}
              </p>
              <span className="text-[8px] text-slate-300">•</span>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isOnline ? 'text-green-500' : 'text-slate-400'}`}>
                {isOnline ? 'Dostępny' : 'Niedostępny'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {viewerIsManager && !isCurrentUser && (
            <button 
              onClick={handleDeleteClick}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          )}
          <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-all" />
        </div>
      </Link>

      {showModal && mounted && createPortal(
        <div 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative overflow-hidden text-slate-900 cursor-default">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-red-50/50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} /> Usuń z projektu
              </h3>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(false); }} 
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Czy na pewno chcesz usunąć użytkownika <span className="font-bold text-slate-900">{displayName}</span> z tego projektu? <br/><br/>
                Osoba ta utraci dostęp do zadań, tablicy Kanban i wszystkich powiązanych materiałów. Ta operacja jest nieodwracalna.
              </p>

              <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(false); }} 
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <button 
                  onClick={confirmRemove}
                  disabled={isRemoving} 
                  className="flex-2 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isRemoving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  {isRemoving ? 'Usuwanie...' : 'Tak, usuń członka'}
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  )
}