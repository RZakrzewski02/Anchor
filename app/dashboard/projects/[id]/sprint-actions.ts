'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

export async function completeSprint(projectId: string, sprintId: string) {
  const supabase = await createClient()

  const { data: completedTasks } = await supabase
    .from('tasks')
    .select('assignee_id, specialization')
    .eq('sprint_id', sprintId)
    .eq('status', 'done')
    .not('assignee_id', 'is', null)


  if (completedTasks && completedTasks.length > 0) {
    for (const task of completedTasks) {
      await supabase.rpc('add_user_exp', { 
        target_user_id: task.assignee_id, 
        target_spec: task.specialization, 
        points: 20 
      })
    }
  }

  const { error: tasksError } = await supabase
    .from('tasks')
    .update({ sprint_id: null })
    .eq('sprint_id', sprintId)
    .neq('status', 'done')

  if (tasksError) return { error: tasksError.message }

  const { error: sprintError } = await supabase
    .from('sprints')
    .update({ status: 'completed' })
    .eq('id', sprintId)

  if (sprintError) return { error: sprintError.message }

  revalidatePath(`/dashboard/projects/${projectId}`)
  redirect(`/dashboard/projects/${projectId}`)
}