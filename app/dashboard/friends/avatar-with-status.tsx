'use client'

import { usePresence } from './presence-provider'
// 1. Importujemy ikonę User
import { User } from 'lucide-react'

type Props = {
  userId: string
  avatarUrl?: string | null
  fullName: string
  isActiveChat?: boolean
}

export default function AvatarWithStatus({ userId, avatarUrl, fullName, isActiveChat = false }: Props) {
  const { isUserOnline } = usePresence()
  const online = isUserOnline(userId)

  return (
    <div className="relative shrink-0">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border transition-colors ${
        isActiveChat 
          ? 'bg-blue-500 border-blue-400 text-white' 
          : 'bg-slate-100 border-slate-200 text-slate-400'
      }`}>
        {avatarUrl ? (
          <img src={avatarUrl} className="w-full h-full object-cover" alt={fullName} />
        ) : (
          /* 2. ZMIANA: Usunięto fullName[0] i wstawiono ikonę User */
          <User size={isActiveChat ? 20 : 18} />
        )}
      </div>
      
      {/* Kropka statusu */}
      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full transition-colors duration-300 ${
        online ? 'bg-green-500' : 'bg-slate-300'
      }`} title={online ? 'Dostępny' : 'Niedostępny'}></div>
    </div>
  )
}