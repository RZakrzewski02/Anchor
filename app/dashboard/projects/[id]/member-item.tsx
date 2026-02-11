'use client'

import { useState } from 'react'
import { User, Trash2, Loader2 } from 'lucide-react'
import { removeMember } from './member-actions'

interface MemberItemProps {
  userId: string;
  role: string;
  isCurrentUser: boolean;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
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
  
  const profileData = Array.isArray(profiles) ? profiles[0] : profiles;

  const displayName = isCurrentUser 
    ? "Ty" 
    : (profileData?.full_name || 
       (profileData?.first_name ? `${profileData.first_name} ${profileData.last_name || ''}`.trim() : null) || 
       "Użytkownik");

  // FUNKCJA USUWANIA
  const handleDelete = async () => {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${displayName} z projektu?`)) return
    
    setIsRemoving(true)
    const result = await removeMember(projectId, userId)
    
    if (result?.error) {
      alert("Błąd podczas usuwania: " + result.error)
      setIsRemoving(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${
          isCurrentUser 
            ? 'bg-blue-50 border-blue-200 text-blue-600' 
            : 'bg-slate-50 border-slate-100 text-slate-400'
        }`}>
          <User size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">
            {displayName}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {role === 'manager' ? 'Kierownik' : 'Współpracownik'}
          </p>
        </div>
      </div>

      {/* PRZYCISK USUWANIA - TERAZ Z FUNKCJĄ ONCLICK */}
      {viewerIsManager && !isCurrentUser && (
        <button 
          onClick={handleDelete}
          disabled={isRemoving}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg md:opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
          title="Usuń z projektu"
        >
          {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      )}
    </div>
  )
}