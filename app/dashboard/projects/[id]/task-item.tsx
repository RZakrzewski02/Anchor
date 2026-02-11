'use client'

import { useState } from 'react'
import { 
  User, Edit2, Trash2, Calendar, X, Loader2, AlignLeft, UserCheck, Tag, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react'
import { updateTask, deleteTask, toggleTaskSprint } from './task-actions'

export default function TaskItem({ task, members, projectId, currentUserId, activeSprintId }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  const assignee = members.find((m: any) => m.user_id === task.assignee_id)
  // Wyciągamy dane profilowe dla wykonawcy
  const assigneeProfile = Array.isArray(assignee?.profiles) ? assignee.profiles[0] : assignee?.profiles;

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) return
    setIsDeleting(true)
    const result = await deleteTask(projectId, task.id)
    if (result?.error) {
      alert("Błąd: " + result.error)
      setIsDeleting(false)
    }
  }

  const handleSprintToggle = async () => {
    setIsMoving(true)
    const newSprintId = task.sprint_id ? null : activeSprintId
    const result = await toggleTaskSprint(projectId, task.id, newSprintId)
    if (result?.error) alert(result.error)
    setIsMoving(false)
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group flex justify-between items-center">
      
      <div className="flex flex-col gap-1.5 flex-1 pr-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {task.title}
          </span>
          {task.specialization && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/50">
              {task.specialization}
            </span>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-slate-500 line-clamp-1 italic max-w-2xl">{task.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 mt-1">
          {(task.start_date || task.end_date) && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} className="text-blue-500" />
              <span>{task.start_date || '?'} — {task.end_date || '?'}</span>
            </div>
          )}

          {/* POPRAWIONE WYŚWIETLANIE: Używamy imienia/nazwiska */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <UserCheck size={12} className={assignee ? "text-green-600" : "text-slate-300"} />
            <span className="text-slate-700">
              {assignee 
                ? (assignee.user_id === currentUserId ? "Ty" : (assigneeProfile?.full_name || "Przypisane")) 
                : "Nieprzypisane"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {(activeSprintId || task.sprint_id) && (
          <button 
            onClick={handleSprintToggle}
            disabled={isMoving}
            className={`p-2 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer ${
              task.sprint_id ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {isMoving ? <Loader2 size={16} className="animate-spin" /> : 
             task.sprint_id ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
          </button>
        )}

        <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer">
          <Edit2 size={16} />
        </button>
        
        <button onClick={handleDelete} disabled={isDeleting} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer">
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 text-slate-900">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Edytuj zadanie</h3>
              <button onClick={() => setIsEditing(false)} className="cursor-pointer"><X size={20} /></button>
            </div>
            <form action={async (fd) => { await updateTask(projectId, task.id, fd); setIsEditing(false); }} className="p-6 flex flex-col gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nazwa</label>
                <input name="title" defaultValue={task.title} required className="w-full px-3 py-2 border rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" name="start_date" defaultValue={task.start_date} className="w-full px-3 py-2 border rounded-lg text-slate-900" />
                <input type="date" name="end_date" defaultValue={task.end_date} className="w-full px-3 py-2 border rounded-lg text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="specialization" defaultValue={task.specialization} className="w-full px-3 py-2 border rounded-lg text-slate-900">
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="mobile developer">Mobile</option>
                  <option value="game developer">Game Dev</option>
                </select>
                
                {/* POPRAWIONE WYBIERANIE: Używamy profiles */}
                <select name="assignee_id" defaultValue={task.assignee_id || 'unassigned'} className="w-full px-3 py-2 border rounded-lg text-slate-900">
                  <option value="unassigned">-- Brak --</option>
                  {members.map((m: any) => {
                    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                    const name = m.user_id === currentUserId 
                      ? "Ty" 
                      : (p?.full_name || "Członek zespołu");
                    return <option key={m.user_id} value={m.user_id}>{name}</option>
                  })}
                </select>
              </div>
              <textarea name="description" defaultValue={task.description} className="w-full px-3 py-2 border rounded-lg text-slate-900 h-24 resize-none" placeholder="Opis..." />
              <button type="submit" className="bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors">Zapisz zmiany</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}