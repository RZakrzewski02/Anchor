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

  // 2. Pobieramy wszystkie niedokończone zadania z tego sprintu
  const { data: incompleteTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('sprint_id', sprintId)
    .neq('status', 'done')

  // 3. Obsługa niedokończonych zadań
  if (incompleteTasks && incompleteTasks.length > 0) {
    const taskIds = incompleteTasks.map(t => t.id)

    if (incompleteAction === 'backlog') {
      // Opcja A: Wyrzucamy do backlogu (sprint_id = null)
      await supabase.from('tasks').update({ sprint_id: null }).in('id', taskIds)
      
    } else if (incompleteAction === 'new_sprint' && newSprintName) {
      // Opcja B: Tworzymy nowy sprint i przenosimy tam zadania
      const { data: newSprint, error: newSprintError } = await supabase
        .from('sprints')
        .insert({ 
          project_id: projectId, 
          name: newSprintName, 
          status: 'active' 
        })
        .select('id')
        .single()

      if (newSprintError) return { error: "Błąd tworzenia nowego sprintu: " + newSprintError.message }

      // Przenosimy zadania do nowego sprintu
      await supabase.from('tasks').update({ sprint_id: newSprint.id }).in('id', taskIds)
    }
  }

  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}