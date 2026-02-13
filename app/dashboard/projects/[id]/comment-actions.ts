'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(taskId: string, content: string, parentId: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Musisz być zalogowany' }
  if (!content.trim()) return { error: 'Treść nie może być pusta' }

  const { error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      user_id: user.id,
      content: content,
      parent_id: parentId
    })

  if (error) return { error: error.message }
  
  // Nie używamy tu revalidatePath, bo komentarze będziemy ładować dynamicznie w komponencie klienta
  return { success: true }
}