'use client'

import { useState } from 'react'
import { User, Trash2, Loader2, ChevronRight } from 'lucide-react'
import { removeMember } from './member-actions'
import Link from 'next/link'

interface MemberItemProps {
  userId: string;
  role: string;
  isCurrentUser: boolean;
  profiles: {
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
  
  const displayName = isCurrentUser 
    ? "Ty" 
    : (profiles?.full_name || 
       (profiles?.first_name ? `${profiles.first_name} ${profiles.last_name || ''}`.trim() : null) || 
       "Użytkownik");

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Blokujemy przejście do profilu przy kliknięciu w usuń
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${displayName} z projektu?`)) return
    setIsRemoving(true)
    const result = await removeMember(projectId, userId)
    if (result?.error) {
      alert("Błąd podczas usuwania: " + result.error)
      setIsRemoving(false)
    }
  }

  return (
    <Link 
      href={isCurrentUser ? "/dashboard/settings/profile" : `/dashboard/users/${userId}`}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
    >
      <div className="flex items-center gap-3">
        {/* AVATAR */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm overflow-hidden shrink-0 ${
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

        {/* INFO O CZŁONKU */}
        <div className="truncate">
          <p className="text-sm font-bold text-slate-900 truncate leading-tight">
            {displayName}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {role === 'manager' ? 'Kierownik' : 'Członek'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Przycisk usuwania */}
        {viewerIsManager && !isCurrentUser && (
          <button 
            onClick={handleDelete}
            disabled={isRemoving}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        )}
        <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-all" />
      </div>
    </Link>
  )
}