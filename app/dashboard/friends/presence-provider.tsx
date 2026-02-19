'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

type PresenceContextType = {
  onlineUsers: Set<string>
  isUserOnline: (userId: string) => boolean
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUsers: new Set(),
  isUserOnline: () => false,
})

export const usePresence = () => useContext(PresenceContext)

export default function PresenceProvider({ children, user }: { children: React.ReactNode, user: User }) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    const channel = supabase.channel('global_presence')

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const onlineIds = new Set<string>()
        
        for (const id in newState) {
          const presenceEntry = newState[id] as any[]
          if (presenceEntry && presenceEntry.length > 0) {
             presenceEntry.forEach(entry => {
               if (entry.user_id) onlineIds.add(entry.user_id)
             })
          }
        }
        setOnlineUsers(onlineIds)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [user, supabase])

  const isUserOnline = (userId: string) => onlineUsers.has(userId)

  return (
    <PresenceContext.Provider value={{ onlineUsers, isUserOnline }}>
      {children}
    </PresenceContext.Provider>
  )
}