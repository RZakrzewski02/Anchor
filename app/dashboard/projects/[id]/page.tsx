import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import InviteForm from './invite-form'
import { Plus, Layers, ListTodo, User, Ghost } from 'lucide-react'
import MemberItem from './member-item'

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

  // 3. Pobierz listę WSZYSTKICH członków projektu (Prawdziwe dane)
  const { data: allMembers } = await supabase
    .from('project_members')
    .select('user_id, role, joined_at')
    .eq('project_id', project.id)

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
            {/* Przycisk widoczny, ale na razie bez akcji */}
            <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm cursor-pointer">
              <Plus size={16} />
              Stwórz sprint
            </button>
          </div>

          {/* EMPTY STATE: Brak aktywnego sprintu */}
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center min-h-37.5">
            <Layers className="text-slate-300 mb-3" size={48} />
            <h3 className="font-bold text-slate-700">Brak aktywnego sprintu</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Nie wybrano jeszcze zadań do realizacji w tym cyklu.
            </p>
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
            <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors text-sm shadow-sm cursor-pointer">
              <Plus size={16} />
              Dodaj zadanie
            </button>
          </div>

          {/* EMPTY STATE: Brak zadań */}
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 opacity-60">
            <Ghost className="text-slate-400 mb-3" size={40} />
            <h3 className="font-bold text-slate-600">Backlog jest pusty</h3>
            <p className="text-slate-500 text-sm">Dodaj pierwsze zadanie, aby rozpocząć planowanie.</p>
          </div>
        </div>
      </main>


      {/* --- PRAWA STRONA (SIDEBAR) --- */}
      <aside className="w-full lg:w-96 bg-white flex flex-col h-full border-l border-slate-200">
        <div className="p-6 sticky top-0">
          
          <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
            Zespół Projektowy
          </h2>

          {/* Formularz tylko dla managera */}
          {isManager && (
            <div className="mb-8">
              <InviteForm projectId={project.id} />
            </div>
          )}

          {/* Lista członków */}
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