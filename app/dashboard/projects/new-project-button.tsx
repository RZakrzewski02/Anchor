'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createProject } from './actions'

export default function NewProjectButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    await createProject(formData)
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm cursor-pointer text-sm md:text-base"
      >
        <Plus size={18} />
        <span className="whitespace-nowrap">Nowy projekt</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Utwórz nowy projekt</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form action={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 uppercase">Nazwa projektu</label>
                <input name="name" required placeholder="np. Nowa Aplikacja" className="w-full px-3 py-2 border text-slate-700 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 uppercase">Opis (opcjonalnie)</label>
                <textarea name="description" placeholder="Krótki opis..." className="w-full px-3 py-2 border text-slate-700 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" />
              </div>

              <button disabled={isLoading} type="submit" className="bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 cursor-pointer">
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                {isLoading ? 'Tworzenie...' : 'Utwórz projekt'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}