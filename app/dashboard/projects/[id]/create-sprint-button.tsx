'use client'

import { useState } from 'react'
import { Plus, Loader2, X, Layers } from 'lucide-react'
import { createSprint } from './sprint-actions'

export default function CreateSprintButton({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    
    const result = await createSprint(projectId, formData)
    
    setIsLoading(false)
    
    if (result?.error) {
      alert("Błąd podczas tworzenia sprintu: " + result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm shadow-sm cursor-pointer"
      >
        <Plus size={16} />
        Stwórz sprint
      </button>

      {/* MODAL TWORZENIA SPRINTU */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative overflow-hidden text-slate-900">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Layers className="text-blue-500" size={20} /> Nowy Sprint
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formularz */}
            <form action={handleSubmit} className="p-6 flex flex-col gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nazwa sprintu <span className="text-red-500">*</span>
                </label>
                <input 
                  name="name" 
                  required 
                  autoFocus
                  placeholder="np. Sprint #1 - Logowanie" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>

              {/* Przyciski */}
              <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <button 
                  disabled={isLoading} 
                  type="submit" 
                  className="flex-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading && <Loader2 size={18} className="animate-spin" />}
                  {isLoading ? 'Tworzenie...' : 'Utwórz sprint'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}