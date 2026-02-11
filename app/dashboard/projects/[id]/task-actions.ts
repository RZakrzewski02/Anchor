'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(projectId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assigneeId = formData.get('assignee_id') as string
  const specialization = formData.get('specialization') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    title,
    description,
    assignee_id: assigneeId === 'unassigned' ? null : assigneeId,
    specialization,
    start_date: startDate || null,
    end_date: endDate || null,
    status: 'todo'
  })

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function updateTask(projectId: string, taskId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assigneeId = formData.get('assignee_id') as string
  const specialization = formData.get('specialization') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  const { error } = await supabase.from('tasks').update({
    title,
    description,
    assignee_id: assigneeId === 'unassigned' ? null : assigneeId,
    specialization,
    start_date: startDate || null,
    end_date: endDate || null
  }).eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function deleteTask(projectId: string, taskId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function toggleTaskSprint(projectId: string, taskId: string, sprintId: string | null) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ sprint_id: sprintId })
    .eq('id', taskId)

  if (error) return { error: error.message }
  
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function updateTaskStatus(projectId: string, taskId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/projects/${projectId}/sprint/[sprintId]`)
  return { success: true }
}