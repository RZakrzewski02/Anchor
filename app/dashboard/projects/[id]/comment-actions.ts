'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/app/dashboard/notification-actions'

export async function addComment(taskId: string, content: string, parentId: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Musisz być zalogowany' }
  if (!content.trim()) return { error: 'Treść nie może być pusta' }

  const { error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      user_id: user.id,
      content: content,
      parent_id: parentId
    })

  if (error) return { error: error.message }

  try {
    const { data: task } = await supabase
      .from('tasks')
      .select('title, project_id, assignee_id')
      .eq('id', taskId)
      .single()

    if (task) {
      if (parentId) {
        const { data: parentComment } = await supabase
          .from('task_comments')
          .select('user_id')
          .eq('id', parentId)
          .single()

        if (parentComment) {
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
    console.error("Błąd wysyłania powiadomienia:", err)
  }

  
  return { success: true }
}