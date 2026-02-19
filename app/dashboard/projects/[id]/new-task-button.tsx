'use client'

import { useState } from 'react'
import { Plus, X, Loader2, User, Tag } from 'lucide-react'
import { createTask } from './task-actions'
import AssigneeSelect from './assignee-select'

type Member = {
  user_id: string
  role: string
  profiles?: any 
}

export default function NewTaskButton({ 
  projectId, 
  members, 
  currentUserId 
}: { 
  projectId: string, 
  members: Member[], 
  currentUserId: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState('unassigned')
  const [isLoading, setIsLoading] = useState(false)
  
  // NOWE: Stan do śledzenia wybranej specjalizacji "w locie"
  const [currentSpecialization, setCurrentSpecialization] = useState('frontend')

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await createTask(projectId, formData)
    setIsLoading(false)

    if (result?.error) {
      alert(result.error)
    } else {
      setIsOpen(false)
      setSelectedAssignee('unassigned')
      setCurrentSpecialization('frontend') // Reset specjalizacji po sukcesie
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm shadow-sm cursor-pointer"
      >
        <Plus size={16} />
        Dodaj zadanie
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 relative">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Nowe zadanie</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nazwa zadania <span className="text-red-500">*</span></label>
                <input name="title" required placeholder="Co trzeba zrobić?" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Tag size={14}/> Specjalizacja</label>
                {/* ZMIANA: Pole select jest teraz kontrolowane przez stan currentSpecialization */}
                <select 
                  name="specialization" 
                  value={currentSpecialization}
                  onChange={(e) => setCurrentSpecialization(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="mobile developer">Mobile Developer</option>
                  <option value="game developer">Game Developer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opis (opcjonalnie)</label>
                <textarea name="description" placeholder="Dodatkowe szczegóły..." className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start</label>
                  <input type="date" name="start_date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Koniec</label>
                  <input type="date" name="end_date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><User size={14}/> Przypisz do</label>
                {/* ZMIANA: Przekazujemy taskSpecialization={currentSpecialization} */}
                <AssigneeSelect 
                  name="assignee_id"
                  members={members}
                  selectedId={selectedAssignee}
                  onSelect={setSelectedAssignee}
                  currentUserId={currentUserId}
                  taskSpecialization={currentSpecialization}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Anuluj</button>
                <button disabled={isLoading} type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-md cursor-pointer disabled:opacity-50">
                  {isLoading && <Loader2 size={18} className="animate-spin" />}
                  {isLoading ? 'Zapisywanie...' : 'Utwórz zadanie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}