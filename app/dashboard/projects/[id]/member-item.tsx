'use client'

import { useState } from 'react'
import { User, Trash2, Loader2 } from 'lucide-react'
import { removeMember } from './member-actions'

type MemberItemProps = {
  projectId: string
  userId: string
  role: string
  isCurrentUser: boolean
  viewerIsManager: boolean
}

export default function MemberItem({ projectId, userId, role, isCurrentUser, viewerIsManager }: MemberItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRemove = async () => {
    if (!confirm('Czy na pewno chcesz usunąć tę osobę z projektu?')) return

    setIsDeleting(true)
    const result = await removeMember(projectId, userId)
    
    if (result.error) {
      alert(result.error)
      setIsDeleting(false)
    }
    // Jeśli sukces, revalidatePath w akcji odświeży listę, a komponent zniknie
  }

  // Logika wyświetlania przycisku usuwania:
  // 1. Oglądający musi być Managerem.
  // 2. Nie można usunąć samego siebie (isCurrentUser).
  const showDeleteButton = viewerIsManager && !isCurrentUser

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
          role === 'manager' 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-slate-100 text-slate-500'
        }`}>
          <User size={14} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            {isCurrentUser ? 'Ty' : 'Użytkownik'}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {role === 'manager' ? 'Kierownik' : 'Współpracownik'}
          </p>
        </div>
      </div>

      {showDeleteButton && (
        <button 
          onClick={handleRemove}
          disabled={isDeleting}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
          title="Usuń z projektu"
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      )}
    </div>
  )
}