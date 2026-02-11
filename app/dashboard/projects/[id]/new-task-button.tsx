'use client'

import { useState } from 'react'
import { Plus, X, Loader2, User, Tag } from 'lucide-react'
import { createTask } from './task-actions'

type Member = {
  user_id: string
  role: string
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
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const result = await createTask(projectId, formData)
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
        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors text-sm shadow-sm cursor-pointer"
      >
        <Plus size={16} />
        Dodaj zadanie
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Nowe zadanie</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 flex flex-col gap-5">
              
              {/* Tytuł */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nazwa zadania <span className="text-red-500">*</span></label>
                <input 
                  name="title" 
                  required 
                  placeholder="Co trzeba zrobić?" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Specjalizacja */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Tag size={14}/> Specjalizacja
                </label>
                <div className="relative">
                  <select 
                    name="specialization"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="mobile developer">Mobile Developer</option>
                    <option value="game developer">Game Developer</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              {/* Opis */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opis (opcjonalnie)</label>
                <textarea 
                  name="description" 
                  placeholder="Dodatkowe szczegóły..." 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all"
                />
              </div>

              {/* Przypisanie */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <User size={14}/> Przypisz do
                </label>
                <div className="relative">
                  <select 
                    name="assignee_id"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="unassigned">-- Nieprzypisane --</option>
                    {members.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.user_id === currentUserId 
                          ? 'Ty (Przypisz sobie)' 
                          : `Członek zespołu (${member.role === 'manager' ? 'Kierownik' : 'Współpracownik'})`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Anuluj
                </button>
                <button 
                  disabled={isLoading}
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-md shadow-blue-100"
                >
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