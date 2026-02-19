'use client'

import { useState } from 'react'
import { updateTaskStatus } from '../../task-actions'
import { useRouter } from 'next/navigation'
// ZMIANA: Importujemy ikonki
import { User, Calendar, AlignLeft } from 'lucide-react' 

// ZMIANA: Dodajemy members do propsów
export default function KanbanBoard({ tasks, projectId, members }: { tasks: any[], projectId: string, members: any[] }) {
  const router = useRouter()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const columns = [
    { id: 'todo', title: 'Do zrobienia', color: 'bg-slate-200' },
    { id: 'in_progress', title: 'W trakcie', color: 'bg-blue-500' },
    { id: 'done', title: 'Zakończone', color: 'bg-emerald-500' }
  ]

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id)
    e.dataTransfer.setData('taskId', id)
  }

  const onDrop = async (e: React.DragEvent, newStatus: string) => {
    const taskId = e.dataTransfer.getData('taskId')
    setDraggingId(null)
    await updateTaskStatus(projectId, taskId, newStatus)
    router.refresh()
  }

  // Funkcja skracająca format daty (np. 2024-05-12 -> 12.05)
  const formatShortDate = (dateString: string) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(col => (
        <div 
          key={col.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, col.id)}
          className="bg-slate-100/50 border border-slate-200 rounded-2xl p-4 min-h-75 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${col.color}`} />
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{col.title}</h3>
            <span className="ml-auto bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {tasks.filter(t => t.status === col.id).length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {tasks.filter(t => t.status === col.id).map(task => {
              // Szukamy profilu osoby przypisanej do zadania
              const assignee = members?.find(m => m.user_id === task.assignee_id)?.profiles;

              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all flex flex-col gap-3 ${draggingId === task.id ? 'opacity-50 scale-95' : ''}`}
                >
                  {/* Nagłówek karty: Specjalizacja */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-200">
                      {task.specialization || 'Zadanie'}
                    </span>
                  </div>
                  
                  {/* Tytuł i krótki opis */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 leading-snug">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 flex gap-1 items-start">
                        <AlignLeft size={12} className="shrink-0 mt-0.5 opacity-50" />
                        <span className="italic">{task.description}</span>
                      </p>
                    )}
                  </div>

                  {/* Stopka karty: Daty i Awatar */}
                  <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      {task.end_date ? (
                        <>
                          <Calendar size={12} className="text-blue-500" />
                          <span>{formatShortDate(task.start_date)} - {formatShortDate(task.end_date)}</span>
                        </>
                      ) : (
                        <span className="opacity-50">Brak daty</span>
                      )}
                    </div>

                    {/* Awatar z Tooltipem */}
                    <div 
                      className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm" 
                      title={assignee?.full_name || 'Nieprzypisane'}
                    >
                      {assignee?.avatar_url ? (
                        <img src={assignee.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={12} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}