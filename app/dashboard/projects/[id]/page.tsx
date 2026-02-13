import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

import InviteForm from './invite-form'
import NewTaskButton from './new-task-button'
import MemberItem from './member-item'
import TaskItem from './task-item'
import CreateSprintButton from './create-sprint-button'
import CompleteSprintButton from './sprint/[sprintId]/complete-button'
import CompleteProjectButton from './complete-project-button' // Import przycisku

import { 
  Layers, 
  ListTodo, 
  Ghost, 
  Users, 
  ArrowRight, 
  LayoutDashboard, 
  History,
  FolderKanban // Ikona do nagłówka
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
    .select('user_id, role')
    .eq('project_id', id)

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

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] font-sans bg-white text-slate-900">
      
      {/* --- NOWY NAGŁÓWEK PROJEKTU --- */}
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FolderKanban size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none text-slate-900">{project.name}</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {project.status === 'completed' ? 'Projekt Zakończony' : 'Projekt Aktywny'}
            </p>
          </div>
        </div>
        
        {/* Przycisk zakończenia widoczny tylko dla Managera i tylko gdy projekt jest aktywny */}
        {isManager && project.status !== 'completed' && (
          <CompleteProjectButton projectId={id} />
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
          <div className="p-8 border-t border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6"><History className="text-slate-400" size={20} /> Historia Sprintów</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedSprints?.map(s => (
                <Link key={s.id} href={`/dashboard/projects/${id}/sprint/${s.id}`} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-all group overflow-hidden">
                  <div className="truncate">
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 truncate">{s.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Zakończono: {new Date(s.created_at).toLocaleDateString('pl-PL')}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 shrink-0" />
                </Link>
              ))}
            </div>
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