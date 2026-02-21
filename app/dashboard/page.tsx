import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Briefcase,
  ListTodo,
  FolderKanban,
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react'

export default async function DashboardPage(props: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  
  const viewYear = searchParams.year ? parseInt(searchParams.year) : now.getFullYear()
  const viewMonth = searchParams.month ? parseInt(searchParams.month) : now.getMonth()

  const currentViewDate = new Date(viewYear, viewMonth, 1)

  const prevDate = new Date(viewYear, viewMonth - 1, 1)
  const nextDate = new Date(viewYear, viewMonth + 1, 1)
  

  const prevLink = `/dashboard?month=${prevDate.getMonth()}&year=${prevDate.getFullYear()}`
  const nextLink = `/dashboard?month=${nextDate.getMonth()}&year=${nextDate.getFullYear()}`
  const resetLink = `/dashboard`

  const currentYear = currentViewDate.getFullYear()
  const currentMonth = currentViewDate.getMonth()
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = (new Date(currentYear, currentMonth, 1).getDay() || 7) - 1 

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptySlots = Array.from({ length: firstDayIndex }, (_, i) => i)

  const monthName = currentViewDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  const { data: userProjects } = await supabase
    .from('project_members')
    .select(`
      project_id,
      status,
      projects (id, name, status)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')

  const projects = userProjects?.map((p: any) => {
    const proj = Array.isArray(p.projects) ? p.projects[0] : p.projects;
    return proj;
  }).filter((p: any) => p && p.status !== 'completed') || []

  const projectIds = projects.map((p: any) => p.id)

  const { data: allProjectMembers } = await supabase
    .from('project_members')
    .select(`project_id, profiles (avatar_url, full_name, first_name)`)
    .in('project_id', projectIds)

  const { data: myTasksRaw } = await supabase
    .from('tasks')
    .select(`*, projects (name, status)`)
    .eq('assignee_id', user.id)
    .neq('status', 'done')
    .order('end_date', { ascending: true })

  const myTasks = myTasksRaw?.filter((t: any) => {
    const p = Array.isArray(t.projects) ? t.projects[0] : t.projects;
    return p && p.status !== 'completed';
  }) || []

  const activeTasksCount = myTasks.length

  const tasksNoDate = myTasks.filter((t: any) => !t.end_date)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 font-sans text-slate-900 min-h-screen">
      
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Witaj ponownie!</h1>
        <p className="text-slate-500 font-medium">Twój harmonogram pracy.</p>
      </header>

      {/* STATYSTYKI GÓRNE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <ListTodo size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Wszystkie Zadania</p>
            <p className="text-3xl font-black text-slate-900">{activeTasksCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Briefcase size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aktywne Projekty</p>
            <p className="text-3xl font-black text-slate-900">{projects.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEWA KOLUMNA: KALENDARZ */}
        <div className="xl:col-span-2 space-y-5">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-1">
            
            <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
              <Link 
                href={prevLink} 
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                title="Poprzedni miesiąc"
              >
                <ChevronLeft size={20} />
              </Link>
              
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 min-w-35 justify-center">
                <CalendarIcon size={18} className="text-blue-600" /> 
                <span className="capitalize">{monthName}</span>
              </h2>

              <Link 
                href={nextLink}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                title="Następny miesiąc"
              >
                <ChevronRight size={20} />
              </Link>
            </div>

            {(viewMonth !== now.getMonth() || viewYear !== now.getFullYear()) && (
               <Link href={resetLink} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                 Wróć do dzisiaj
               </Link>
            )}
            
            {viewMonth === now.getMonth() && viewYear === now.getFullYear() && (
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wide bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                 Dzisiaj: {now.toLocaleDateString('pl-PL')}
               </div>
            )}
          </div>
          
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm p-4 md:p-6">
            <div className="grid grid-cols-7 mb-4 text-center">
              {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
                <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {emptySlots.map(slot => <div key={`empty-${slot}`} className="min-h-25 bg-slate-50/20 rounded-xl" />)}
              {daysArray.map(day => {
                const dayTasks = myTasks.filter((t: any) => {
                  if (!t.end_date) return false
                  const d = new Date(t.end_date)
                  return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear
                })

                const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()

                return (
                  <div 
                    key={day} 
                    className={`min-h-25 border rounded-xl p-2 flex flex-col gap-1 transition-all ${
                      isToday ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50/30 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-xs font-bold mb-1 ml-1 ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    
                    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-35 custom-scrollbar">
                      {dayTasks.map((t: any) => (
                        <Link 
                          key={t.id} 
                          href={`/dashboard/projects/${t.project_id}`}
                          className="block bg-white border border-slate-200 p-2 rounded-lg shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
                          title={`${t.title}`}
                        >
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate mb-0.5">
                            {(t.projects as any)?.name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-700 group-hover:text-blue-600 truncate leading-tight">
                            {t.title}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sekcja zadań bez terminu */}
          {tasksNoDate.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-16 -mt-16 pointer-events-none" />
              
              <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 relative z-10">
                <AlertCircle size={20} className="text-blue-500" /> Zadania bez terminu
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                {tasksNoDate.map((t: any) => (
                  <Link 
                    key={t.id} 
                    href={`/dashboard/projects/${t.project_id}`}
                    className="group flex flex-col bg-white border border-slate-200 p-3.5 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all h-full"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div/>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {(t.projects as any)?.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 leading-snug">
                      {t.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PRAWA KOLUMNA: PROJEKTY */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 px-1">
            <FolderKanban size={22} className="text-blue-600" /> Projekty
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