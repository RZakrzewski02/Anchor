'use client'

import { useState } from 'react'
import { 
  User, Edit2, Trash2, Calendar, X, Loader2, UserCheck, Tag, ArrowUpCircle, ArrowDownCircle,
  MessageSquare
} from 'lucide-react'
import { updateTask, deleteTask, toggleTaskSprint } from './task-actions'
import AssigneeSelect from './assignee-select'
import TaskComments from './task-comments'

export default function TaskItem({ task, members, projectId, currentUserId, activeSprintId }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState(task.assignee_id || 'unassigned')

  const assignee = members.find((m: any) => m.user_id === task.assignee_id)
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
    <>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group flex justify-between items-center">
        <div className="flex flex-col gap-1.5 flex-1 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</span>
            {task.specialization && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/50">{task.specialization}</span>
            )}
          </div>
          {task.description && <p className="text-sm text-slate-500 line-clamp-1 italic max-w-2xl">{task.description}</p>}
          <div className="flex flex-wrap items-center gap-4 mt-1">
            {(task.start_date || task.end_date) && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar size={12} className="text-blue-500" />
                <span>{task.start_date || '?'} — {task.end_date || '?'}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {assigneeProfile?.avatar_url ? (
                  <img src={assigneeProfile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <User size={10} className={assignee ? "text-green-600" : "text-slate-300"} />
                )}
              </div>
              <span className="text-slate-700">
                {assignee ? (assignee.user_id === currentUserId ? "Ty" : (assigneeProfile?.full_name || "Przypisane")) : "Nieprzypisane"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* PRZYCISK PRZENOSZENIA - Teraz pierwszy od lewej i większy (size 22) */}
          {(activeSprintId || task.sprint_id) && (
            <button 
              onClick={handleSprintToggle} 
              disabled={isMoving} 
              className={`p-2 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer ${task.sprint_id ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
              title={task.sprint_id ? "Przenieś do backlogu" : "Przenieś do sprintu"}
            >
              {isMoving ? (
                <Loader2 size={22} className="animate-spin" />
              ) : task.sprint_id ? (
                <ArrowDownCircle size={22} />
              ) : (
                <ArrowUpCircle size={22} />
              )}
            </button>
          )}

          {/* PRZYCISK DO KOMENTARZY */}
          <button 
            onClick={() => setShowComments(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Komentarze"
          >
            <MessageSquare size={16} />
          </button>

          {/* EDYCJA */}
          <button 
            onClick={() => { setIsEditing(true); setSelectedAssignee(task.assignee_id || 'unassigned'); }} 
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Edytuj"
          >
            <Edit2 size={16} />
          </button>

          {/* USUWANIE */}
          <button 
            onClick={handleDelete} 
            disabled={isDeleting} 
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Usuń"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {/* MODAL KOMENTARZY */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowComments(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 relative flex flex-col max-h-[80vh] z-10">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Dyskusja</h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-50">{task.title}</p>
                </div>
              </div>
              <button onClick={() => setShowComments(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-0 overflow-hidden flex-1 flex flex-col">
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <TaskComments taskId={task.id} currentUserId={currentUserId} />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDYCJI */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 text-slate-900 relative">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Edytuj zadanie</h3>
              <button onClick={() => setIsEditing(false)} className="cursor-pointer"><X size={20} /></button>
            </div>
            <form action={async (fd) => { await updateTask(projectId, task.id, fd); setIsEditing(false); }} className="p-6 flex flex-col gap-5 text-slate-900">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nazwa</label>
                <input name="title" defaultValue={task.title} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-slate-900">
                <input type="date" name="start_date" defaultValue={task.start_date} className="w-full px-3 py-2 border rounded-lg" />
                <input type="date" name="end_date" defaultValue={task.end_date} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="specialization" defaultValue={task.specialization} className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="mobile developer">Mobile Developer</option>
                  <option value="game developer">Game Developer</option>
                </select>
                <AssigneeSelect 
                  name="assignee_id"
                  members={members}
                  selectedId={selectedAssignee}
                  onSelect={setSelectedAssignee}
                  currentUserId={currentUserId}
                />
              </div>
              <textarea name="description" defaultValue={task.description} className="w-full px-3 py-2 border rounded-lg h-24 resize-none" placeholder="Opis..." />
              <button type="submit" className="bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md">Zapisz zmiany</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}