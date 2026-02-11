'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(projectId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assigneeId = formData.get('assignee_id') as string
  const specialization = formData.get('specialization') as string

  if (!title) return { error: 'Tytuł jest wymagany' }

  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    title,
    description,
    assignee_id: assigneeId === 'unassigned' ? null : assigneeId,
    specialization,
    status: 'todo'
  })

  if (error) {
    console.error('Błąd dodawania zadania:', error)
    return { error: 'Nie udało się dodać zadania.' }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}