'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeSprintAdvanced(
  projectId: string, 
  sprintId: string, 
  incompleteAction: 'backlog' | 'new_sprint',
  newSprintName?: string
) {
  const supabase = await createClient()

  const { error: sprintError } = await supabase
    .from('sprints')
    .update({ status: 'completed' })
    .eq('id', sprintId)

  if (sprintError) return { error: "Nie udało się zakończyć sprintu: " + sprintError.message }

  const { data: completedTasks } = await supabase
    .from('tasks')
    .select('id, assignee_id, specialization')
    .eq('sprint_id', sprintId)
    .eq('status', 'done')
    .not('assignee_id', 'is', null)

  if (completedTasks && completedTasks.length > 0) {
    for (const task of completedTasks) {
      const expToAdd = 20 
      const spec = task.specialization || 'Ogólne'
      const userId = task.assignee_id

      const { data: existingExp } = await supabase
        .from('user_exp')
        .select('exp')
        .eq('user_id', userId)
        .eq('specialization', spec)
        .single()

      if (existingExp) {
        await supabase
          .from('user_exp')
          .update({ exp: existingExp.exp + expToAdd })
          .eq('user_id', userId)
          .eq('specialization', spec)
      } else {
        await supabase
          .from('user_exp')
          .insert({ 
            user_id: userId, 
            specialization: spec, 
            exp: expToAdd 
          })
      }
    }
  }

  const { data: incompleteTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('sprint_id', sprintId)
    .neq('status', 'done')

  if (incompleteTasks && incompleteTasks.length > 0) {
    const taskIds = incompleteTasks.map(t => t.id)

    if (incompleteAction === 'backlog') {
      await supabase.from('tasks').update({ sprint_id: null }).in('id', taskIds)
      
    } else if (incompleteAction === 'new_sprint' && newSprintName) {
      const { data: newSprint, error: newSprintError } = await supabase
        .from('sprints')
        .insert({ project_id: projectId, name: newSprintName, status: 'active' })
        .select('id')
        .single()

      if (newSprintError) return { error: "Błąd tworzenia nowego sprintu: " + newSprintError.message }

      await supabase.from('tasks').update({ sprint_id: newSprint.id }).in('id', taskIds)
    }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}