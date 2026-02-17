'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RealtimeFriendsListener({ userId }: { userId: string }) {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('friends_updates')
      .on(
        'postgres_changes' as any,
        { 
          event: '*', 
          table: 'direct_messages',
          filter: `receiver_id=eq.${userId}` 
        }, 
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, router, supabase])

  return null
}