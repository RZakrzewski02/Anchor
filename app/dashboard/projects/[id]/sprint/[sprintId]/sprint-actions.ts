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

  // 1. Oznaczamy aktualny sprint jako zakończony
  const { error: sprintError } = await supabase
    .from('sprints')
    .update({ status: 'completed' })
    .eq('id', sprintId)

  if (sprintError) return { error: "Nie udało się zakończyć sprintu: " + sprintError.message }

  // Pobieramy ZAKOŃCZONE zadania z tego sprintu (tylko te, które mają przypisaną osobę)
  const { data: completedTasks } = await supabase
    .from('tasks')
    .select('id, assignee_id, specialization') // Dodaj tu 'story_points' jeśli masz wagę zadania
    .eq('sprint_id', sprintId)
    .eq('status', 'done')
    .not('assignee_id', 'is', null)

  if (completedTasks && completedTasks.length > 0) {
    // Przechodzimy przez każde ukończone zadanie
    for (const task of completedTasks) {
      // Jeśli wdrożyłeś wagi zadań, użyj task.story_points, w przeciwnym razie np. 50 EXP
      const expToAdd = 20 
      const spec = task.specialization || 'Ogólne'
      const userId = task.assignee_id

      // Sprawdzamy, czy użytkownik ma już rekord w user_exp dla tej specjalizacji
      const { data: existingExp } = await supabase
        .from('user_exp')
        .select('exp')
        .eq('user_id', userId)
        .eq('specialization', spec)
        .single()

      if (existingExp) {
        // ZWIĘKSZAMY OBECNY EXP
        await supabase
          .from('user_exp')
          .update({ exp: existingExp.exp + expToAdd })
          .eq('user_id', userId)
          .eq('specialization', spec)
      } else {
        // TWORZYMY NOWY REKORD DLA TEJ SPECJALIZACJI
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
      // Wyrzucamy do backlogu
      await supabase.from('tasks').update({ sprint_id: null }).in('id', taskIds)
      
    } else if (incompleteAction === 'new_sprint' && newSprintName) {
      // Tworzymy nowy sprint
      const { data: newSprint, error: newSprintError } = await supabase
        .from('sprints')
        .insert({ project_id: projectId, name: newSprintName, status: 'active' })
        .select('id')
        .single()

      if (newSprintError) return { error: "Błąd tworzenia nowego sprintu: " + newSprintError.message }

      // Przenosimy zadania do nowego sprintu
      await supabase.from('tasks').update({ sprint_id: newSprint.id }).in('id', taskIds)
    }
  }

  // Odświeżamy interfejs
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}