import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

// Nasze komponenty
import InviteForm from './invite-form'
import NewTaskButton from './new-task-button'
import MemberItem from './member-item'
import TaskItem from './task-item'
import CreateSprintButton from './create-sprint-button'

// Ikony
import { 
  Layers, 
  ListTodo, 
  Ghost, 
  Users, 
  ArrowRight, 
  LayoutDashboard 
} from 'lucide-react'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Rozpakowanie params (Next.js 15 wymaga await dla params)
  const { id } = await params
  const supabase = await createClient()
  
  // 2. Pobranie zalogowanego użytkownika
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 3. Pobranie danych projektu
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .single()

  if (projectError || !project) notFound()

  // 4. Sprawdzenie uprawnień i roli użytkownika
  const { data: currentMember } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .single()

  if (!currentMember) redirect('/dashboard/projects')

  const isManager = currentMember.role === 'manager'

  // 5. Pobranie członków zespołu
  const { data: allMembers } = await supabase
    .from('project_members')
    .select('user_id, role')
    .eq('project_id', id)

  // 6. Pobranie aktywnego sprintu
  const { data: activeSprint } = await supabase
    .from('sprints')
    .select('id, name')
    .eq('project_id', id)
    .eq('status', 'active')
    .maybeSingle()

  // 7. Pobranie wszystkich zadań projektu
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Podział zadań na Sprint i Backlog
  const sprintTasks = tasks?.filter(t => t.sprint_id === activeSprint?.id && t.sprint_id !== null) || []
  const backlogTasks = tasks?.filter(t => !t.sprint_id) || []

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] font-sans bg-white text-slate-900">
      
      {/* --- LEWA STRONA: ZARZĄDZANIE PRACĄ --- */}
      <main className="flex-1 flex flex-col border-r border-slate-200">
        
        {/* SEKCJA 1: AKTYWNY SPRINT */}
        <div className="p-8 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="text-blue-600" size={24} />
                {activeSprint ? activeSprint.name : 'Aktywny Sprint'}
              </h2>
              <p className="text-slate-500 text-sm">Zadania przypisane do bieżącego cyklu pracy.</p>
            </div>
            
            <div className="flex items-center gap-3">
              {activeSprint ? (
                <Link 
                  href={`/dashboard/projects/${id}/sprint/${activeSprint.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all text-sm shadow-md flex items-center gap-2"
                >
                  <LayoutDashboard size={16} />
                  Otwórz tablicę
                  <ArrowRight size={16} />
                </Link>
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
              <div className="flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                <p className="text-slate-500 text-sm font-medium">Sprint jest pusty.</p>
                <p className="text-slate-400 text-xs mt-1">Użyj strzałek przy zadaniach w backlogu, aby je tu przenieść.</p>
              </div>
            )
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-500 text-sm">
                Brak aktywnego sprintu. {isManager ? 'Utwórz nowy, aby zacząć planowanie.' : 'Poczekaj na otwarcie sprintu przez kierownika.'}
              </p>
            </div>
          )}
        </div>

        {/* SEKCJA 2: BACKLOG */}
        <div className="p-8 flex-1 bg-slate-50/30 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ListTodo className="text-indigo-600" size={24} />
                Backlog Projektu
              </h2>
              <p className="text-slate-500 text-sm">Wszystkie zadania oczekujące na realizację.</p>
            </div>
            
            <NewTaskButton 
              projectId={id} 
              members={allMembers || []} 
              currentUserId={user.id} 
            />
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
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
              <Ghost className="text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-400">Backlog jest pusty</h3>
              <p className="text-slate-400 text-sm">Zacznij od dodania pierwszego zadania.</p>
            </div>
          )}
        </div>
      </main>

      {/* --- PRAWA STRONA: SIDEBAR --- */}
      <aside className="w-full lg:w-96 bg-white flex flex-col h-full border-l border-slate-200">
        <div className="p-6 sticky top-0">
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Users size={20} className="text-slate-400" />
            Zespół Projektowy
          </h2>

          {/* Formularz zapraszania (tylko dla managera) */}
          {isManager && (
            <div className="mb-8">
              <InviteForm projectId={id} />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between">
              Członkowie <span>{allMembers?.length || 0}</span>
            </h3>
            
            <div className="space-y-1">
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
        </div>
      </aside>

    </div>
  )
}