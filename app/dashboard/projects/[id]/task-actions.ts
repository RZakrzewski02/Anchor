'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
// 1. NOWY IMPORT
import { createNotification } from '@/app/dashboard/notification-actions'

export async function createTask(projectId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const assigneeId = formData.get('assignee_id') as string
  const specialization = formData.get('specialization') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  // 2. ZMIANA W CREATE: Dodajemy .select().single(), aby otrzymać dane nowo utworzonego zadania
  const { data: newTask, error } = await supabase.from('tasks').insert({
    project_id: projectId,
    title,
    description,
    assignee_id: assigneeId === 'unassigned' ? null : assigneeId,
    specialization,
    start_date: startDate || null,
    end_date: endDate || null,
    status: 'todo'
  })
  .select() // Ważne: prosimy bazę o zwrot danych
  .single() // Oczekujemy jednego rekordu

  if (error) return { error: error.message }

  // 3. WYSYŁANIE POWIADOMIENIA (jeśli przypisano kogoś przy tworzeniu)
  if (newTask.assignee_id) {
    await createNotification(
      newTask.assignee_id, // ID osoby przypisanej
      'assignment',        // Typ powiadomienia
      newTask.id,          // ID Zadania
      'task',              // Typ zasobu
      { 
        task_title: title,
        project_id: projectId 
      }
    )
  }

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

  // Ustalamy finalne ID (null lub UUID)
  const finalAssigneeId = assigneeId === 'unassigned' ? null : assigneeId

  const { error } = await supabase.from('tasks').update({
    title,
    description,
    assignee_id: finalAssigneeId,
    specialization,
    start_date: startDate || null,
    end_date: endDate || null
  }).eq('id', taskId)

  if (error) return { error: error.message }

  // 4. WYSYŁANIE POWIADOMIENIA PRZY EDYCJI
  // Jeśli w formularzu wybrano pracownika (nie jest null), wysyłamy powiadomienie
  if (finalAssigneeId) {
    await createNotification(
      finalAssigneeId,
      'assignment',
      taskId,
      'task',
      { 
        task_title: title,
        project_id: projectId 
      }
    )
  }

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