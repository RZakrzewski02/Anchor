'use server'

import { createClient } from '@/lib/supabase/server'
// Pamiętaj o imporcie funkcji powiadomień!
import { createNotification } from '@/app/dashboard/notification-actions'

export async function addComment(taskId: string, content: string, parentId: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Musisz być zalogowany' }
  if (!content.trim()) return { error: 'Treść nie może być pusta' }

  // 1. Dodajemy komentarz do bazy
  const { error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      user_id: user.id,
      content: content,
      parent_id: parentId
    })

  if (error) return { error: error.message }

  // --- LOGIKA POWIADOMIEŃ ---
  try {
    // A. Pobieramy dane zadania (potrzebne do treści powiadomienia: tytuł i ID projektu)
    const { data: task } = await supabase
      .from('tasks')
      .select('title, project_id, assignee_id')
      .eq('id', taskId)
      .single()

    if (task) {
      if (parentId) {
        // PRZYPADEK 1: ODPOWIEDŹ NA KOMENTARZ
        // Pobieramy autora komentarza-rodzica
        const { data: parentComment } = await supabase
          .from('task_comments')
          .select('user_id')
          .eq('id', parentId)
          .single()

        if (parentComment) {
          // Wysyłamy powiadomienie do autora rodzica (createNotification samo sprawdzi, czy to nie Ty)
          await createNotification(
            parentComment.user_id,
            'reply',
            taskId,
            'task',
            { 
              task_title: task.title, 
              project_id: task.project_id 
            }
          )
        }
      } else {
        // PRZYPADEK 2: NOWY KOMENTARZ
        // Powiadamiamy osobę przypisaną do zadania (jeśli istnieje)
        if (task.assignee_id) {
          await createNotification(
            task.assignee_id,
            'comment',
            taskId,
            'task',
            { 
              task_title: task.title, 
              project_id: task.project_id 
            }
          )
        }
      }
    }
  } catch (err) {
    // Logujemy błąd powiadomienia, ale nie przerywamy funkcji (komentarz już dodano)
    console.error("Błąd wysyłania powiadomienia:", err)
  }
  // --- KONIEC LOGIKI POWIADOMIEŃ ---
  
  return { success: true }
}