import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Briefcase, 
  Calendar as CalendarIcon, 
  ChevronRight,
  ShieldAlert,
  Search
} from 'lucide-react'
import MembersModal from './members-modal'

export default async function AdminPage(props: {
  searchParams: Promise<{ query?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard') 
  }

  let queryBuilder = supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (query) {
    queryBuilder = queryBuilder.ilike('name', `%${query}%`)
  }

  const { data: projects, error } = await queryBuilder

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Panel Administratora</h1>
          <p className="text-gray-500 mt-1">
            Globalny widok projektów w systemie.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Zarządzanie projektami użytkowników
          </h2>
        </div>

        <form method="GET" className="p-4 border-b bg-white flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Szukaj projektu po nazwie..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit" 
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Szukaj
          </button>
          {query && (
            <Link 
              href="/dashboard/admin" 
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Wyczyść
            </Link>
          )}
        </form>
        
        <div className="p-6">
          {error ? (
            <div className="text-red-500 font-medium">
              Błąd ładowania danych: {error.message}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="divide-y">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lg text-gray-900">{project.name}</p>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                    )}
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Utworzono: {new Date(project.created_at).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MembersModal projectId={project.id} projectName={project.name} />

                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Wejdź
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {query ? 'Nie znaleziono projektów pasujących do wyszukiwania.' : 'Brak aktywnych projektów w systemie.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}