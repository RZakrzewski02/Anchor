'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, Loader2, X } from 'lucide-react'
import { completeProject } from './project-actions'

export default function CompleteProjectButton({ projectId }: { projectId: string }) {
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
    if (!isLoading) setIsOpen(false)
  }

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    try {
      const result = await completeProject(projectId)
      
      if (result?.error) {
        alert("Błąd: " + result.error)
        setIsLoading(false)
        return
      }

      setIsOpen(false)
      
    } catch (e: any) {
      console.log("Projekt zakończony pomyślnie, trwa odświeżanie...");
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={isLoading}
        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm shadow-md disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        Zakończ projekt
      </button>

      {/* MODAL */}
      {isOpen && mounted && createPortal(
        <div 
          onClick={handleClose}
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative overflow-hidden text-slate-900"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-emerald-50/50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={20} /> Zakończ projekt
              </h3>
              <button 
                onClick={handleClose} 
                disabled={isLoading}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Czy na pewno chcesz zakończyć ten projekt?
              </p>

              {/* Przyciski */}
              <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={isLoading} 
                  className="flex-2 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isLoading ? 'Zakańczanie...' : 'Tak, zakończ projekt'}
                </button>
              </div>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </>
  )
}