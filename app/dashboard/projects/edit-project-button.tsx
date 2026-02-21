'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Edit2, X, Loader2, FolderKanban, Github } from 'lucide-react'
import { updateProject } from './actions'

export default function EditProjectButton({ project }: { project: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    const result = await updateProject(project.id, formData)
    setIsLoading(false)

    if (result?.error) {
      alert("Błąd podczas zapisywania: " + result.error)
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={handleOpen}
        className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer relative z-10"
        title="Edytuj projekt"
      >
        <Edit2 size={18} />
      </button>
      {isOpen && mounted && createPortal(
        <div 
          onClick={handleClose} 
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative overflow-hidden text-slate-900"
          >
            {/* Nagłówek modala */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <FolderKanban className="text-blue-500" size={20} /> Edytuj projekt
              </h3>
              <button 
                onClick={handleClose} 
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formularz */}
            <form action={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nazwa projektu <span className="text-red-500">*</span>
                </label>
                <input 
                  name="name" 
                  defaultValue={project.name}
                  required 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Opis
                </label>
                <textarea 
                  name="description" 
                  defaultValue={project.description || ''}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all" 
                />
              </div>

              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Github size={14} /> Repozytorium GitHub
                </label>
                <input 
                  name="githubRepo" 
                  defaultValue={project.github_repo || ''}
                  placeholder="np. facebook/react" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                />
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Podaj w formacie: właściciel/nazwa-repozytorium
                </p>
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Token dostępu (GitHub PAT)</span>
                  <span className="text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded uppercase">Tylko prywatne</span>
                </label>
                <input 
                  type="password"
                  name="githubToken" 
                  defaultValue={project.github_token || ''}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm" 
                />
                <p className="text-[10px] text-slate-400 font-medium mt-1 leading-tight">
                  Wymagane tylko dla prywatnych repozytoriów. Wygeneruj token (Classic) na GitHubie z uprawnieniem <strong>"repo"</strong>.
                </p>
              </div>

              {/* Przyciski */}
              <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleClose} 
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
                  {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}