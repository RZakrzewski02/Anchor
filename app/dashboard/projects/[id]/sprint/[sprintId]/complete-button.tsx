'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, X, ListTodo, ArrowRight, Layers, AlertCircle, Sparkles } from 'lucide-react'
// Zaktualizuj ścieżkę do akcji, jeśli masz inną!
import { completeSprintAdvanced } from './sprint-actions' 

export default function CompleteSprintButton({ 
  projectId, 
  sprintId, 
  sprintName, 
  sprintTasks 
}: { 
  projectId: string, 
  sprintId: string,
  sprintName: string,
  sprintTasks: any[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Stan formularza
  const [action, setAction] = useState<'backlog' | 'new_sprint'>('new_sprint')
  const [newSprintName, setNewSprintName] = useState(`${sprintName} - Kontynuacja`)

  // Obliczenia statystyk
  const totalTasks = sprintTasks.length
  const completedTasks = sprintTasks.filter(t => t.status === 'done').length
  const incompleteTasks = totalTasks - completedTasks
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const result = await completeSprintAdvanced(projectId, sprintId, action, newSprintName)
    
    setIsLoading(false)
    if (result?.error) {
      alert(result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm shadow-md flex items-center gap-2 cursor-pointer"
      >
        <CheckCircle2 size={16} />
        Zakończ sprint
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 relative overflow-hidden text-slate-900">
            
            {/* Nagłówek */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" /> Podsumowanie Sprintu
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{sprintName}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleComplete} className="p-6 flex flex-col gap-6">
              
              {/* Statystyki ukończenia */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Postęp prac</span>
                  <span className="text-2xl font-black text-emerald-600">{progressPercent}%</span>
                </div>
                {/* Pasek postępu */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-3 border border-slate-100 shadow-inner">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500"/> Zakończone: {completedTasks}</span>
                  <span className="flex items-center gap-1 text-amber-600"><AlertCircle size={12}/> Otwarte: {incompleteTasks}</span>
                </div>
              </div>

              {/* Opcje dla niedokończonych zadań */}
              {incompleteTasks > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ListTodo size={16} className="text-blue-500" />
                    Co zrobić z niedokończonymi zadaniami ({incompleteTasks})?
                  </h4>
                  
                  {/* Opcja 1: Nowy sprint */}
                  <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${action === 'new_sprint' ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="incompleteAction" checked={action === 'new_sprint'} onChange={() => setAction('new_sprint')} className="w-4 h-4 text-blue-600 cursor-pointer" />
                      <span className="font-bold text-sm text-slate-800 flex items-center gap-2"><Layers size={16} className="text-blue-600"/> Utwórz nowy sprint</span>
                    </div>
                    {action === 'new_sprint' && (
                      <div className="mt-3 ml-7">
                        <input 
                          type="text" 
                          required 
                          value={newSprintName}
                          onChange={(e) => setNewSprintName(e.target.value)}
                          placeholder="Nazwa nowego sprintu..." 
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    )}
                  </label>

                  {/* Opcja 2: Backlog */}
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${action === 'backlog' ? 'border-slate-500 bg-slate-50 shadow-sm ring-1 ring-slate-500' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="incompleteAction" checked={action === 'backlog'} onChange={() => setAction('backlog')} className="w-4 h-4 text-slate-600 cursor-pointer" />
                    <span className="font-bold text-sm text-slate-700 flex items-center gap-2"><ArrowRight size={16} className="text-slate-400"/> Zwróć do Backlogu</span>
                  </label>
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
                  <Sparkles size={18} /> Gratulacje! Zespół ukończył wszystkie zadania w sprincie.
                </div>
              )}

              {/* Przyciski */}
              <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  Anuluj
                </button>
                <button disabled={isLoading} type="submit" className="flex-2 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50">
                  {isLoading && <Loader2 size={18} className="animate-spin" />}
                  {isLoading ? 'Kończenie...' : 'Zatwierdź i Zakończ'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}