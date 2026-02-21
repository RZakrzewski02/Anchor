'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nie jesteś zalogowany' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      created_by: user.id 
    })
    .select()
    .single()

  if (projectError) {
    console.error('Błąd tworzenia projektu:', projectError)
    return { error: projectError.message }
  }

  const { error: memberError } = await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.id,
      role: 'manager'
    })

  if (memberError) {
    console.error('Błąd dodawania członka:', memberError)
    return { error: 'Projekt utworzony, ale nie udało się przypisać roli.' }
  }

  revalidatePath('/dashboard/projects')
  return { success: true }
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const githubRepo = formData.get('githubRepo') as string
  const githubToken = formData.get('githubToken') as string

  const { error } = await supabase
    .from('projects')
    .update({ name, description, github_repo: githubRepo, github_token: githubToken})
    .eq('id', projectId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/projects')
  return { success: true }
}