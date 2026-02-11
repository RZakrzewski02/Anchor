'use client'

import { useState } from 'react'
import { updateTaskStatus } from '../../task-actions'
import { useRouter } from 'next/navigation'

export default function KanbanBoard({ tasks, projectId }: { tasks: any[], projectId: string }) {
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
    
    // Optymistyczna aktualizacja UI (opcjonalnie) lub po prostu wywołanie akcji
    await updateTaskStatus(projectId, taskId, newStatus)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map(col => (
        <div 
          key={col.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, col.id)}
          className="bg-slate-100/50 border border-slate-200 rounded-2xl p-4 min-h-100 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${col.color}`} />
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{col.title}</h3>
            <span className="ml-auto bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {tasks.filter(t => t.status === col.id).length}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {tasks.filter(t => t.status === col.id).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
                className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 transition-all ${draggingId === task.id ? 'opacity-50' : ''}`}
              >
                <div className="text-[10px] font-bold text-blue-600 uppercase mb-1">{task.specialization}</div>
                <h4 className="font-bold text-sm text-slate-800">{task.title}</h4>
                {task.end_date && <p className="text-[10px] text-slate-400 mt-2 italic">Termin: {task.end_date}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}