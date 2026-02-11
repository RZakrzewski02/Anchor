import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import InviteForm from './invite-form'
import NewTaskButton from './new-task-button'
import MemberItem from './member-item'
import { Layers, ListTodo, User, Ghost, Clock } from 'lucide-react'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Pobierz dane projektu
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  // 2. Pobierz aktualnego użytkownika i jego rolę
  const { data: currentMember } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', project.id)
    .eq('user_id', user?.id)
    .single()

  if (!currentMember) redirect('/dashboard/projects')

  const isManager = currentMember.role === 'manager'

  // 3. Pobierz listę członków
  const { data: allMembers } = await supabase
    .from('project_members')
    .select('user_id, role')
    .eq('project_id', project.id)

  // 4. POBIERZ ZADANIA Z BAZY (Nowość)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] font-sans bg-white">
      
      {/* --- LEWA STRONA (GŁÓWNA ZAWARTOŚĆ) --- */}
      <main className="flex-1 flex flex-col border-r border-slate-200">
        
        {/* SEKJA 1: SPRINTY */}
        <div className="p-8 border-b border-slate-200 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="text-blue-600" size={24} />
                Aktywny Sprint
              </h2>
              <p className="text-slate-500 text-sm mt-1">Zarządzaj cyklami pracy.</p>
            </div>
            <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm cursor-pointer">
              Stwórz sprint
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center min-h-37.5">
            <Layers className="text-slate-300 mb-3" size={48} />
            <h3 className="font-bold text-slate-700">Brak aktywnego sprintu</h3>
            <p className="text-slate-500 text-sm max-w-xs">Nie wybrano jeszcze zadań do realizacji.</p>
          </div>
        </div>

        {/* SEKJA 2: BACKLOG / ZADANIA */}
        <div className="p-8 flex-1 bg-slate-50/30 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ListTodo className="text-indigo-600" size={24} />
                Backlog Projektu
              </h2>
              <p className="text-slate-500 text-sm mt-1">Wszystkie zadania do zrobienia.</p>
            </div>
            
            <NewTaskButton 
              projectId={project.id} 
              members={allMembers || []}
              currentUserId={user?.id || ''}
            />
          </div>

          {/* LOGIKA WYŚWIETLANIA ZADAŃ */}
          {tasks && tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {task.title}
                      </span>
                      {task.specialization && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                          {task.specialization}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 line-clamp-1 italic">{task.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock size={12} />
                      {new Date(task.created_at).toLocaleDateString('pl-PL')}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-white shadow-sm flex items-center justify-center text-slate-400" title={task.assignee_id ? 'Przypisane' : 'Brak przypisania'}>
                      <User size={14} className={task.assignee_id ? 'text-blue-500' : ''} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 opacity-60">
              <Ghost className="text-slate-400 mb-3" size={40} />
              <h3 className="font-bold text-slate-600">Backlog jest pusty</h3>
              <p className="text-slate-500 text-sm">Dodaj pierwsze zadanie, aby rozpocząć planowanie.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- PRAWA STRONA (SIDEBAR) --- */}
      <aside className="w-full lg:w-96 bg-white flex flex-col h-full border-l border-slate-200">
        <div className="p-6 sticky top-0">
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
            Zespół Projektowy
          </h2>

          {isManager && (
            <div className="mb-8">
              <InviteForm projectId={project.id} />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex justify-between">
              Członkowie <span>{allMembers?.length || 0}</span>
            </h3>
            <div className="space-y-1">
              {allMembers?.map((member) => (
                <MemberItem 
                  key={member.user_id}
                  projectId={project.id}
                  userId={member.user_id}
                  role={member.role}
                  isCurrentUser={member.user_id === user?.id}
                  viewerIsManager={isManager}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}