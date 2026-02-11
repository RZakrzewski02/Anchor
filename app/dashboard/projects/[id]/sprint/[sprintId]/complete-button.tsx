'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { completeSprint } from '../../sprint-actions'

export default function CompleteSprintButton({ projectId, sprintId }: { projectId: string, sprintId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async () => {
    if (!confirm('Czy na pewno chcesz zakończyć sprint? Zadania niedokończone wrócą do backlogu.')) return
    
    setIsLoading(true)
    const result = await completeSprint(projectId, sprintId)
    
    // Jeśli funkcja zwróci błąd (np. z powodu RLS), wyświetlimy go
    if (result?.error) {
      alert("Błąd podczas kończenia sprintu: " + result.error)
      setIsLoading(false)
    }
    // Jeśli sukces, redirect wewnątrz akcji sam przeładuje stronę
  }

  return (
    <button 
      onClick={handleComplete}
      disabled={isLoading}
      className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
      Zakończ sprint
    </button>
  )
}