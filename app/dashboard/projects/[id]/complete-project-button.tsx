'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { completeProject } from './project-actions'

export default function CompleteProjectButton({ projectId }: { projectId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async () => {
    if (!confirm("Czy na pewno chcesz zakończyć ten projekt? Zostanie on przeniesiony do sekcji archiwalnej.")) return
    
    setIsLoading(true)
    try {
      const result = await completeProject(projectId)
      if (result?.error) {
        alert("Błąd: " + result.error)
      }
    } catch (e) {
      alert("Wystąpił nieoczekiwany błąd")
    } finally {
      // To zapewnia, że kółko przestanie się kręcić niezależnie od wyniku
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isLoading}
      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm shadow-md disabled:opacity-50 cursor-pointer"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
      Zakończ projekt
    </button>
  )
}