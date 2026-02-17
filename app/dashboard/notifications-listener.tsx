// app/dashboard/notifications-listener.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RealtimeNotificationsListener({ userId }: { userId: string }) {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes' as any,
        {
          event: '*', // ZMIANA: Słuchaj na INSERT, UPDATE i DELETE
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // To wymusi na layout.tsx ponowne pobranie 'count' z bazy
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, router, supabase])

  return null
}