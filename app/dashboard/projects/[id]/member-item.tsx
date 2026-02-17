'use client'

import { useState } from 'react'
import { User, Trash2, Loader2, ChevronRight } from 'lucide-react'
import { removeMember } from './member-actions'
import Link from 'next/link'
// 1. Importujemy hook od obecności
import { usePresence } from '../../friends/presence-provider'

interface MemberItemProps {
  userId: string;
  role: string;
  isCurrentUser: boolean;
  profiles: {
    id?: string; // Dodane, by mieć pewność co do ID do sprawdzenia obecności
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
  
  // 2. Pobieramy status dostępności dla tego użytkownika
  const { isUserOnline } = usePresence()
  const isOnline = isUserOnline(userId)
  
  const displayName = isCurrentUser 
    ? "Ty" 
    : (profiles?.full_name || 
       (profiles?.first_name ? `${profiles.first_name} ${profiles.last_name || ''}`.trim() : null) || 
       "Użytkownik");

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); 
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
        {/* AVATAR ZE STATUSEM */}
        <div className="relative shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm overflow-hidden ${
            isCurrentUser ? 'border-blue-200' : 'border-slate-100'
          }`}>
            {profiles?.avatar_url ? (
              <img src={profiles.avatar_url} className="w-full h-full object-cover" alt="" />
            ) : (
              // ZMIANA: Zawsze ludek zamiast litery
              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                <User size={18} />
              </div>
            )}
          </div>
          
          {/* 3. KROPKA STATUSU (ONLINE/OFFLINE) */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full transition-colors duration-300 ${
            isOnline ? 'bg-green-500' : 'bg-slate-300'
          }`} />
        </div>

        {/* INFO O CZŁONKU */}
        <div className="truncate">
          <p className="text-sm font-bold text-slate-900 truncate leading-tight">
            {displayName}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {role === 'manager' ? 'Kierownik' : 'Członek'}
            </p>
            {/* 4. INFORMACJA TEKSTOWA O STATUSIE */}
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