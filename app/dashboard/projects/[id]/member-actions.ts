'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function removeMember(projectId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('remove_project_member', {
    _project_id: projectId,
    _user_id: userId
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}