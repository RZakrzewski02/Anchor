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
          event: '*',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
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