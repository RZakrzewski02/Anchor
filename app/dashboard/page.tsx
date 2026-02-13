import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Briefcase,
  ListTodo,
  FolderKanban
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Pobieramy projekty z ich statusem
  const { data: userProjects } = await supabase
    .from('project_members')
    .select(`
      project_id,
      projects (id, name, status)
    `)
    .eq('user_id', user.id)

  // Filtrujemy, aby zostawić tylko AKTYWNE projekty
  const projects = userProjects?.map(p => {
    // Zabezpieczenie na wypadek gdyby Supabase zwrócił tablicę
    const proj = Array.isArray(p.projects) ? p.projects[0] : p.projects;
    return proj;
  }).filter((p: any) => p && p.status !== 'completed') || []

  const projectIds = projects.map((p: any) => p.id)

  // 2. Pobieramy członków tylko dla aktywnych projektów
  const { data: allProjectMembers } = await supabase
    .from('project_members')
    .select(`
      project_id,
      profiles (avatar_url, full_name)
    `)
    .in('project_id', projectIds)

  // 3. Pobieramy zadania i filtrujemy te z zakończonych projektów
  const { data: myTasksRaw } = await supabase
    .from('tasks')
    .select(`
      *,
      projects (name, status)
    `)
    .eq('assignee_id', user.id)
    .neq('status', 'done')
    .order('created_at', { ascending: false })

  const myTasks = myTasksRaw?.filter((t: any) => {
    const p = Array.isArray(t.projects) ? t.projects[0] : t.projects;
    // Pokazuj zadanie tylko jeśli projekt jest aktywny
    return p && p.status !== 'completed';
  }) || []

  const activeTasksCount = myTasks.length

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-900 min-h-screen">
      
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Witaj ponownie!</h1>
        <p className="text-slate-500 font-medium">Oto przegląd Twojej pracy w aktywnych projektach.</p>
      </header>

      {/* STATYSTYKI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ListTodo size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Twoje Zadania</p>
            <p className="text-3xl font-black text-slate-900">{activeTasksCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Briefcase size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aktywne Projekty</p>
            <p className="text-3xl font-black text-slate-900">{projects.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* TWOJE ZADANIA (Lewa kolumna) */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Clock size={22} className="text-blue-600" /> Moje priorytety
            </h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {myTasks && myTasks.length > 0 ? (
              myTasks.map((task: any) => (
                <div key={task.id} className="p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-all flex justify-between items-center group">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">{(task.projects as any)?.name}</span>
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</span>
                    {task.end_date && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <CheckCircle2 size={12} className="text-slate-300" />
                        Termin: {task.end_date}
                      </div>
                    )}
                  </div>
                  <Link href={`/dashboard/projects/${task.project_id}`} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                    <ChevronRight size={24} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-slate-200" />
                </div>
                <p className="text-slate-400 italic text-sm font-medium">Brak pilnych zadań w aktywnych projektach!</p>
              </div>
            )}
          </div>
        </div>

        {/* LISTA PROJEKTÓW (Prawa kolumna) */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <FolderKanban size={22} className="text-indigo-600" /> Projekty
          </h2>
          <div className="space-y-4">
            {projects.length > 0 ? (
              projects.map((project: any) => {
                const projectMembers = allProjectMembers?.filter(m => m.project_id === project.id).slice(0, 4) || []
                
                return (
                  <Link 
                    key={project.id} 
                    href={`/dashboard/projects/${project.id}`}
                    className="block p-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-400 hover:shadow-lg transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                    
                    <div className="relative space-y-5">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 text-lg transition-colors leading-tight">{project.name}</span>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all translate-x-0 group-hover:translate-x-1" />
                      </div>
                      
                      {/* Avatary Zespołu */}
                      <div className="flex items-center -space-x-2.5">
                        {projectMembers.map((m: any, idx) => {
                          const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                          return (
                            <div key={idx} className="w-9 h-9 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm" title={p?.full_name}>
                              {p?.avatar_url ? (
                                <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold bg-slate-50 uppercase">
                                  {p?.first_name?.[0] || '?'}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {(allProjectMembers?.filter(m => m.project_id === project.id).length || 0) > 4 && (
                          <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">
                            +{(allProjectMembers?.filter(m => m.project_id === project.id).length || 0) - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="p-6 bg-white border border-slate-200 rounded-3xl text-center text-slate-400 italic text-sm">
                Brak aktywnych projektów.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}