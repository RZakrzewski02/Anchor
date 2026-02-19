import { createClient } from '@/lib/supabase/server'
import { FolderKanban, FolderCheck, Lock } from 'lucide-react'
import Link from 'next/link'
import NewProjectButton from './new-project-button'
import EditProjectButton from './edit-project-button'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Pobieramy projekty, do których należy użytkownik
  const { data: userProjects } = await supabase
    .from('project_members')
    .select(`project_id, projects (*)`)
    .eq('user_id', user?.id)
    .eq('status', 'active')

  // Mapowanie i rozpakowanie danych z joinów (naprawa błędów any[])
  const projectList = userProjects?.map(p => {
    const proj = Array.isArray(p.projects) ? p.projects[0] : p.projects;
    return proj;
  }).filter(Boolean) || []

  const activeProjects = projectList.filter(p => p.status === 'active' || !p.status)
  const completedProjects = projectList.filter(p => p.status === 'completed')

  return (
    <div className="p-4 md:p-8 font-sans w-full h-full flex flex-col gap-10 bg-slate-50/30">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Projekty</h1>
          <p className="text-slate-500 font-medium mt-1">Zarządzaj swoimi przedsięwzięciami.</p>
        </div>
        <NewProjectButton />
      </header>

      {/* SEKCI: AKTYWNE */}
      <section className="space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
          <FolderKanban size={16} /> Aktywne ({activeProjects.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* SEKCI: ZAKOŃCZONE (ARCHIWUM) */}
      {completedProjects.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-200">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
            <FolderCheck size={16} className="text-emerald-500" /> Archiwum ({completedProjects.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-70">
            {completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} isCompleted />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProjectCard({ project, isCompleted }: { project: any, isCompleted?: boolean }) {
  const content = (
    <div className={`p-5 bg-white border border-slate-200 rounded-xl shadow-sm transition-all h-full relative ${
      isCompleted ? 'bg-slate-50/50 border-slate-100' : 'hover:border-blue-400 hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg transition-colors ${
          isCompleted 
            ? 'bg-slate-100 text-slate-400' 
            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
        }`}>
          {isCompleted ? <Lock size={20} /> : <FolderKanban size={20} />}
        </div>
        
        {!isCompleted && (
          <div className="relative z-10">
            <EditProjectButton project={project} />
          </div>
        )}
      </div>

      <h3 className={`font-bold text-lg mb-2 truncate ${isCompleted ? 'text-slate-400' : 'text-slate-900'}`}>
        {project.name}
      </h3>
      <p className={`text-sm line-clamp-2 ${isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
        {project.description || 'Brak opisu.'}
      </p>
    </div>
  )

  if (isCompleted) {
    return <div className="cursor-not-allowed select-none">{content}</div>
  }

  return (
    <Link href={`/dashboard/projects/${project.id}`} className="group block h-full">
      {content}
    </Link>
  )
}