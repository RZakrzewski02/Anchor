import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

import InviteForm from './invite-form'
import NewTaskButton from './new-task-button'
import MemberItem from './member-item'
import TaskItem from './task-item'
import CreateSprintButton from './create-sprint-button'
import CompleteSprintButton from './sprint/[sprintId]/complete-button'
import CompleteProjectButton from './complete-project-button'

import { 
  Layers, 
  ListTodo, 
  Ghost, 
  Users, 
  ArrowRight, 
  LayoutDashboard, 
  History,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // POBIERAMY DANE PROJEKTU (dodano status do select)
  const { data: project } = await supabase.from('projects').select('id, name, status').eq('id', id).single()
  if (!project) notFound()

  const { data: currentMember } = await supabase.from('project_members').select('role').eq('project_id', id).eq('user_id', user.id).single()
  if (!currentMember) redirect('/dashboard/projects')

  const isManager = currentMember.role === 'manager'

  // 1. POBIERAMY CZŁONKÓW
  const { data: membersRaw } = await supabase
  .from('project_members')
  .select('user_id, role, status') // Dodajemy status
  .eq('project_id', id)
  .eq('status', 'active') // KLUCZ: Pokazuj tylko aktywnych członków

  // 2. POBIERAMY PROFILE (Z avatar_url)
  const userIds = membersRaw?.map(m => m.user_id) || []
  const { data: profilesRaw } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, full_name, avatar_url')
    .in('id', userIds)

  // 3. ŁĄCZYMY DANE
  const allMembers = membersRaw?.map(member => ({
    ...member,
    profiles: profilesRaw?.find(p => p.id === member.user_id) || null
  })) || []

  // Pobieranie Sprintów i Zadań
  const { data: activeSprint } = await supabase.from('sprints').select('id, name').eq('project_id', id).eq('status', 'active').maybeSingle()
  const { data: completedSprints } = await supabase.from('sprints').select('id, name, created_at').eq('project_id', id).eq('status', 'completed').order('created_at', { ascending: false })
  const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false })

  const sprintTasks = tasks?.filter(t => t.sprint_id === activeSprint?.id && t.sprint_id !== null) || []
  const backlogTasks = tasks?.filter(t => !t.sprint_id) || []
  const completedTasks = tasks?.filter(t => t.status === 'done') || []

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] font-sans bg-white text-slate-900">
      
      {/* --- NOWY NAGŁÓWEK PROJEKTU --- */}
      <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-white relative lg:sticky lg:top-0 lg:z-40 shadow-sm gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <FolderKanban size={28} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none text-slate-900 truncate">{project.name}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {project.status === 'completed' ? 'Projekt Zakończony' : 'Projekt Aktywny'}
            </p>
          </div>
        </div>
        
        {/* Przycisk zakończenia widoczny tylko dla Managera i tylko gdy projekt jest aktywny */}
        {isManager && project.status !== 'completed' && (
          <div className="w-full md:w-auto">
             <CompleteProjectButton projectId={id} />
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        <main className="flex-1 flex flex-col border-r border-slate-200">
          
          {/* --- Sekcja Aktywnego Sprintu --- */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="text-blue-600" size={24} />
                  {activeSprint ? activeSprint.name : 'Brak aktywnego sprintu'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {activeSprint ? (
                  <>
                    <Link href={`/dashboard/projects/${id}/sprint/${activeSprint.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all text-sm shadow-md flex items-center gap-2">
                      <LayoutDashboard size={16} /> Tablica
                    </Link>
                    {isManager && <CompleteSprintButton projectId={id} sprintId={activeSprint.id} />}
                  </>
                ) : (
                  isManager && <CreateSprintButton projectId={id} />
                )}
              </div>
            </div>
            <div className="space-y-3">
              {sprintTasks.length > 0 ? sprintTasks.map(task => (
                <TaskItem key={task.id} task={task} members={allMembers} projectId={id} currentUserId={user.id} activeSprintId={activeSprint?.id} />
              )) : activeSprint && <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center font-bold text-slate-400 text-sm">Sprint jest pusty.</div>}
            </div>
          </div>

          {/* --- Sekcja Backlogu --- */}
          <div className="p-8 flex-1 bg-slate-50/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ListTodo className="text-indigo-600" size={24} /> Backlog</h2>
              <NewTaskButton projectId={id} members={allMembers} currentUserId={user.id} />
            </div>
            <div className="space-y-3">
              {backlogTasks.length > 0 ? backlogTasks.map(task => (
                <TaskItem key={task.id} task={task} members={allMembers} projectId={id} currentUserId={user.id} activeSprintId={activeSprint?.id} />
              )) : <div className="text-center py-16 opacity-60"><Ghost className="text-slate-300 mx-auto mb-4" size={48} /><h3 className="text-lg font-bold text-slate-400">Backlog jest pusty</h3></div>}
            </div>
          </div>

          {/* --- Historia --- */}
          <div className="p-4 md:p-8 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Zakończone Zadania</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Lista zadań zakończonych w tym projekcie.</p>
              </div>
            </div>

            {completedTasks && completedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {completedTasks.map((task) => {
                  const assignee = allMembers.find(m => m.user_id === task.assignee_id)?.profiles

                  return (
                    <div 
                      key={task.id} 
                      className="group relative flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all duration-200 min-h-30"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded-full bg-slate-50">
                            {task.specialization || 'General'}
                          </span>
                          {/* Ikona sukcesu */}
                          <div className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCircle2 size={16} />
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-slate-700 text-sm leading-snug mb-4 line-clamp-2 group-hover:text-slate-900">
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                        <div className="flex items-center gap-2">
                          {assignee ? (
                            <>
                              <img 
                                src={assignee.avatar_url || `https://ui-avatars.com/api/?name=${assignee.full_name}&background=random`} 
                                alt="Avatar" 
                                className="w-6 h-6 rounded-full object-cover border border-white shadow-sm"
                              />
                              <span className="text-xs text-slate-500 font-medium truncate max-w-25">
                                {assignee.full_name}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Nieprzypisane</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-emerald-100/50 rounded-2xl bg-emerald-50/10">
                <CheckCircle2 className="mx-auto text-emerald-200 mb-3" size={32} />
                <p className="text-slate-400 font-medium text-sm">Jeszcze żadne zadanie nie zostało zakończone.</p>
              </div>
            )}
          </div>
        </main>

        {/* --- Sidebar (Zespół i Zaproszenia) --- */}
        <aside className="w-full lg:w-96 bg-white flex flex-col border-l border-slate-200">
          <div className="p-6 sticky top-0">
            <h2 className="text-lg font-bold mb-6 pb-4 border-b border-slate-100 flex items-center gap-2"><Users size={20} className="text-slate-400" /> Zespół Projektowy</h2>
            
            {/* Formularz zapraszania */}
            {isManager && <div className="mb-8"><InviteForm projectId={id} /></div>}
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">Członkowie <span>{allMembers.length}</span></h3>
              <div className="space-y-1">
                {allMembers.map((member: any) => (
                  <MemberItem 
                    key={member.user_id}
                    projectId={id}
                    userId={member.user_id}
                    role={member.role}
                    profiles={member.profiles} 
                    isCurrentUser={member.user_id === user.id}
                    viewerIsManager={isManager}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}