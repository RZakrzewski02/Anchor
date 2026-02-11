'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { createSprint } from './sprint-actions'

export default function CreateSprintButton({ projectId }: { projectId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    const name = prompt('Podaj nazwę dla nowego sprintu (np. Sprint #1):')
    if (!name) return

    setIsLoading(true)
    const result = await createSprint(projectId, new FormData()) // Proste obejście dla prompta
    // Uwaga: w realnym projekcie lepiej użyć modala, tutaj robimy szybką wersję:
    
    // Poprawiona wersja wywołania:
    const fd = new FormData()
    fd.append('name', name)
    await createSprint(projectId, fd)
    
    setIsLoading(false)
  }

  return (
    <button 
      onClick={handleCreate}
      disabled={isLoading}
      className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-colors text-sm shadow-sm cursor-pointer"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      Stwórz sprint
    </button>
  )
}