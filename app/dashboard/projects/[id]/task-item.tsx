'use client'

import { useState } from 'react'
import { 
  User, Edit2, Trash2, Calendar, X, Loader2, Tag, ArrowUpCircle, ArrowDownCircle,
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
  const [currentSpecialization, setCurrentSpecialization] = useState(task.specialization || 'frontend')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const assignee = members.find((m: any) => m.user_id === task.assignee_id)
  const assigneeProfile = Array.isArray(assignee?.profiles) ? assignee.profiles[0] : assignee?.profiles;

  const confirmDelete = async () => {
    setIsDeleting(true)
    const result = await deleteTask(projectId, task.id)
    if (result?.error) {
      alert("Błąd: " + result.error)
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleSprintToggle = async () => {
    setIsMoving(true)
    const newSprintId = task.sprint_id ? null : activeSprintId
    const result = await toggleTaskSprint(projectId, task.id, newSprintId)
    if (result?.error) alert(result.error)
    setIsMoving(false)
  }

  async function handleUpdate(formData: FormData) {
    setIsSaving(true)
    await updateTask(projectId, task.id, formData)
    setIsSaving(false)
    setIsEditing(false)
  }

  const googleCalendarLink = () => {
    const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const title = encodeURIComponent(`Zadanie: ${task.title}`);
    const details = encodeURIComponent(task.description || "Brak opisu");
    
    let dates = "";
    if (task.start_date && task.end_date) {
      const start = task.start_date.replace(/-/g, "");
      const end = task.end_date.replace(/-/g, "");
      dates = `&dates=${start}/${end}`;
    }

    return `${baseUrl}&text=${title}&details=${details}${dates}`;
  };

  return (
    <>
      {/* WIDOK ELEMENTU NA LIŚCIE */}
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
                  <img src={assigneeProfile.avatar_url} className="w-full h-full object-cover" alt="" />
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
          {(activeSprintId || task.sprint_id) && (
            <button 
              onClick={handleSprintToggle} 
              disabled={isMoving} 
              className={`p-2 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer ${task.sprint_id ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
              title={task.sprint_id ? "Przenieś do backlogu" : "Przenieś do sprintu"}
            >
              {isMoving ? <Loader2 size={22} className="animate-spin" /> : task.sprint_id ? <ArrowDownCircle size={22} /> : <ArrowUpCircle size={22} />}
            </button>
          )}

          <a 
            href={googleCalendarLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-green-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer flex items-center" 
            title="Dodaj do Kalendarza Google"
          >
            <Calendar size={16} />
          </a>

          <button onClick={() => setShowComments(true)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-indigo-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer" title="Komentarze">
            <MessageSquare size={16} />
          </button>

          <button onClick={() => { setIsEditing(true); setSelectedAssignee(task.assignee_id || 'unassigned'); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer" title="Edytuj">
            <Edit2 size={16} />
          </button>

          <button 
            onClick={() => setShowDeleteModal(true)} 
            disabled={isDeleting} 
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 cursor-pointer" 
            title="Usuń"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-99 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-red-50/50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Trash2 className="text-red-500" size={20} /> Usuń zadanie
              </h3>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                disabled={isDeleting}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Czy na pewno chcesz trwale usunąć zadanie <strong>{task.title}</strong>? <br/><br/>
                Tej operacji nie można cofnąć, a wszystkie komentarze i załączniki do tego zadania również zostaną usunięte.
              </p>

              <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting} 
                  className="flex-2 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  {isDeleting ? 'Usuwanie...' : 'Tak, usuń zadanie'}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* MODAL KOMENTARZY */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowComments(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 relative flex flex-col max-h-[80vh] z-10">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MessageSquare size={20} /></div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Dyskusja</h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-50">{task.title}</p>
                </div>
              </div>
              <button onClick={() => setShowComments(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6"><TaskComments taskId={task.id} currentUserId={currentUserId} /></div>
          </div>
        </div>
      )}

      {/* MODAL EDYCJI */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 relative">
            
            {/* Nagłówek okna */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
              <h3 className="font-bold text-slate-800 text-lg">Edytuj zadanie</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form action={handleUpdate} className="p-6 flex flex-col gap-5">
              {/* Nazwa */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nazwa zadania <span className="text-red-500">*</span></label>
                <input 
                  name="title" 
                  defaultValue={task.title} 
                  required 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>

              {/* Specjalizacja */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Tag size={14}/> Specjalizacja</label>
                <select 
                  name="specialization" 
                  value={currentSpecialization}
                  onChange={(e) => setCurrentSpecialization(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="mobile developer">Mobile Developer</option>
                  <option value="game developer">Game Developer</option>
                </select>
              </div>

              {/* Opis */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opis (opcjonalnie)</label>
                <textarea 
                  name="description" 
                  defaultValue={task.description} 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all" 
                />
              </div>

              {/* Daty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start</label>
                  <input type="date" name="start_date" defaultValue={task.start_date} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Koniec</label>
                  <input type="date" name="end_date" defaultValue={task.end_date} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              {/* Przypisywanie */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><User size={14}/> Przypisz do</label>
                <AssigneeSelect 
                  name="assignee_id"
                  members={members}
                  selectedId={selectedAssignee}
                  onSelect={setSelectedAssignee}
                  currentUserId={currentUserId}
                  taskSpecialization={currentSpecialization}
                />
              </div>

              {/* Przyciski dolne */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <button 
                  disabled={isSaving} 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}