'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/app/dashboard/notification-actions'

export async function inviteMember(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  if (!email) return { error: 'Podaj adres email' }

  const { data: invitedUserId, error: rpcError } = await supabase.rpc('invite_member_by_email', {
    p_project_id: projectId,
    p_email: email
  })

  if (rpcError) {
    return { error: rpcError.message }
  }

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', projectId)
    .single()

  if (invitedUserId) {
    await createNotification(
      invitedUserId,
      'invitation',
      projectId,
      'project',
      { project_name: project?.name || 'Nowy projekt' }
    )
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: 'Zaproszenie zostało wysłane do powiadomień użytkownika!' }
}