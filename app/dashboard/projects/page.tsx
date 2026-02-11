import { createClient } from '@/lib/supabase/server'
import { FolderKanban, Search } from 'lucide-react'
import Link from 'next/link'
import NewProjectButton from './new-project-button'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const projectList = projects || []

  return (
    <div className="p-4 md:p-8 font-sans w-full h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Projekty</h1>
          <p className="text-slate-500 font-medium mt-1">Zarządzaj swoimi przedsięwzięciami.</p>
        </div>
        <div className="flex items-center gap-3">
            <NewProjectButton />
        </div>
      </header>

      <div className="flex-1">
        {projectList.length === 0 ? (
          <div className="h-[60vh] w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center px-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <FolderKanban className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Brak projektów</h3>
            <p className="text-slate-500 max-w-sm mb-6">Nie masz jeszcze żadnych projektów.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {projectList.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FolderKanban size={20} />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{project.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{project.description || 'Brak opisu.'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}