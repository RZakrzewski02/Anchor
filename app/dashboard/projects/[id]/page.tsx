import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

// Komponenty interaktywne
import InviteForm from './invite-form'
import NewTaskButton from './new-task-button'
import MemberItem from './member-item'
import TaskItem from './task-item'
import CreateSprintButton from './create-sprint-button'
import CompleteSprintButton from './sprint/[sprintId]/complete-button' // Import przycisku zakończenia

// Ikony
import { 
  Layers, 
  ListTodo, 
  Ghost, 
  Users, 
  ArrowRight, 
  LayoutDashboard, 
  History 
} from 'lucide-react'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .single()

  if (projectError || !project) notFound()

  const { data: currentMember } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentMember) redirect('/dashboard/projects')

  const isManager = currentMember.role === 'manager'

  const { data: allMembers } = await supabase
    .from('project_members')
    .select('user_id, role')
    .eq('project_id', id)

  const { data: activeSprint } = await supabase
    .from('sprints')
    .select('id, name')
    .eq('project_id', id)
    .eq('status', 'active')
    .maybeSingle()

  const { data: completedSprints } = await supabase
    .from('sprints')
    .select('id, name, created_at')
    .eq('project_id', id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const sprintTasks = tasks?.filter(t => t.sprint_id === activeSprint?.id && t.sprint_id !== null) || []
  const backlogTasks = tasks?.filter(t => !t.sprint_id) || []

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] font-sans bg-white text-slate-900">
      
      <main className="flex-1 flex flex-col border-r border-slate-200">
        
        {/* SEKCJA: AKTYWNY SPRINT */}
        <div className="p-8 border-b border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="text-blue-600" size={24} />
                {activeSprint ? activeSprint.name : 'Brak aktywnego sprintu'}
              </h2>
              <p className="text-slate-500 text-sm">Zadania przypisane do bieżącego cyklu pracy.</p>
            </div>
            
            <div className="flex items-center gap-2">
              {activeSprint ? (
                <>
                  <Link 
                    href={`/dashboard/projects/${id}/sprint/${activeSprint.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all text-sm shadow-md flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    Tablica
                  </Link>
                  {/* TUTAJ: Przycisk zakończenia sprintu dla Managera */}
                  {isManager && (
                    <CompleteSprintButton projectId={id} sprintId={activeSprint.id} />
                  )}
                </>
              ) : (
                isManager && <CreateSprintButton projectId={id} />
              )}
            </div>
          </div>

          {activeSprint ? (
            sprintTasks.length > 0 ? (
              <div className="space-y-3">
                {sprintTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    members={allMembers || []} 
                    projectId={id} 
                    currentUserId={user.id} 
                    activeSprintId={activeSprint.id} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center font-bold text-slate-400">
                Sprint jest pusty. Przenieś zadania z backlogu.
              </div>
            )
          ) : (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-center text-blue-800 text-sm font-medium">
              Aktualnie nie prowadzisz żadnego sprintu.
            </div>
          )}
        </div>

        {/* SEKCJA: BACKLOG */}
        <div className="p-8 flex-1 bg-slate-50/30 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ListTodo className="text-indigo-600" size={24} />
                Backlog Projektu
              </h2>
            </div>
            <NewTaskButton projectId={id} members={allMembers || []} currentUserId={user.id} />
          </div>

          {backlogTasks.length > 0 ? (
            <div className="space-y-3">
              {backlogTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  members={allMembers || []} 
                  projectId={id} 
                  currentUserId={user.id} 
                  activeSprintId={activeSprint?.id} 
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 opacity-60">
              <Ghost className="text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-400">Backlog jest pusty</h3>
            </div>
          )}
        </div>

        {/* SEKCJA: HISTORIA SPRINTÓW */}
        <div className="p-8 border-t border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 font-sans">
            <History className="text-slate-400" size={20} />
            Historia Sprintów
          </h2>
          {completedSprints && completedSprints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedSprints.map(s => (
                <Link 
                  key={s.id}
                  href={`/dashboard/projects/${id}/sprint/${s.id}`}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-slate-50 transition-all group"
                >
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 truncate">{s.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      Zakończono: {new Date(s.created_at).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-4">Brak archiwalnych sprintów.</p>
          )}
        </div>
      </main>

      {/* --- SIDEBAR --- */}
      <aside className="w-full lg:w-96 bg-white flex flex-col border-l border-slate-200">
        <div className="p-6 sticky top-0 text-slate-900">
          <h2 className="text-lg font-bold mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Users size={20} className="text-slate-400" />
            Zespół Projektowy
          </h2>
          {isManager && <div className="mb-8"><InviteForm projectId={id} /></div>}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Członkowie</h3>
            {allMembers?.map((member) => (
              <MemberItem 
                key={member.user_id}
                projectId={id}
                userId={member.user_id}
                role={member.role}
                isCurrentUser={member.user_id === user.id}
                viewerIsManager={isManager}
              />
            ))}
          </div>
        </div>
      </aside>

    </div>
  )
}