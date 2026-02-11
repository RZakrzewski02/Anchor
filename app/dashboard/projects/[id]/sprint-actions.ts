'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSprint(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name) return { error: 'Nazwa sprintu jest wymagana' }

  const { error } = await supabase.from('sprints').insert({
    project_id: projectId,
    name: name,
    status: 'active'
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}