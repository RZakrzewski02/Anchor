import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import KanbanBoard from './kanban-board'
import Roadmap from './roadmap'
import Link from 'next/link'
import { ChevronLeft, LayoutPanelLeft, GanttChartSquare } from 'lucide-react'

export default async function SprintPage({ params }: { params: Promise<{ id: string, sprintId: string }> }) {
  const { id, sprintId } = await params
  const supabase = await createClient()

  // 1. Pobieranie sprintu i zadań
  const { data: sprint } = await supabase.from('sprints').select('*').eq('id', sprintId).single()
  const { data: tasks } = await supabase.from('tasks').select('*').eq('sprint_id', sprintId)
  
  if (!sprint) notFound()

  // 2. Pobieranie członków i ich profili (aby mieć awatary na tablicy)
  const { data: membersRaw } = await supabase.from('project_members').select('user_id, role').eq('project_id', id)
  const userIds = membersRaw?.map(m => m.user_id) || []
  
  const { data: profilesRaw } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, full_name, avatar_url')
    .in('id', userIds)

  // Łączymy w jeden obiekt
  const allMembers = membersRaw?.map(member => ({
    ...member,
    profiles: profilesRaw?.find(p => p.id === member.user_id) || null
  })) || []

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-8">
        <Link href={`/dashboard/projects/${id}`} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm mb-4 transition-colors">
          <ChevronLeft size={16} /> Powrót do projektu
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">{sprint.name}</h1>
            <p className="text-slate-500">Zarządzanie zadaniami i harmonogramem cyklu</p>
          </div>
        </div>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <LayoutPanelLeft className="text-blue-600" size={20} /> Tablica Kanban
          </h2>
          {/* ZMIANA: Przekazujemy allMembers do tablicy Kanban */}
          <KanbanBoard tasks={tasks || []} projectId={id} members={allMembers} />
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <GanttChartSquare className="text-indigo-600" size={20} /> Roadmapa Sprintu
          </h2>
          <Roadmap tasks={tasks || []} />
        </section>
      </div>
    </div>
  )
}