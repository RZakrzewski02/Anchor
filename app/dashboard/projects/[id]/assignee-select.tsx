'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { User, Check, ChevronDown, Zap, ListTodo, Sparkles } from 'lucide-react'

export default function AssigneeSelect({ members, selectedId, onSelect, currentUserId, name, taskSpecialization }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedMember = members.find((m: any) => m.user_id === selectedId)
  const selectedProfile = selectedMember?.profiles

  const sortedMembers = useMemo(() => {
    if (!members) return []

    const enrichedMembers = members.map((m: any) => {
      const specStats = m.experience?.find((e: any) => e.specialization === taskSpecialization)
      const exp = specStats?.exp || 0
      const level = Math.floor(exp / 100)
      const taskCount = m.taskCount || 0

      return { ...m, calculatedLevel: level, calculatedTaskCount: taskCount }
    })

    return enrichedMembers.sort((a: any, b: any) => {
      if (b.calculatedLevel !== a.calculatedLevel) {
        return b.calculatedLevel - a.calculatedLevel
      }
      return a.calculatedTaskCount - b.calculatedTaskCount
    })
  }, [members, taskSpecialization])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name={name} value={selectedId || 'unassigned'} />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm cursor-pointer shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            {selectedProfile?.avatar_url ? (
              <img src={selectedProfile.avatar_url} className="w-full h-full object-cover" alt="" />
            ) : (
              <User size={12} className="text-slate-400" />
            )}
          </div>
          <span className="truncate font-medium">
            {selectedId === 'unassigned' || !selectedId ? '-- Nieprzypisane --' : 
             (selectedId === currentUserId ? 'Ty' : selectedProfile?.full_name || 'Członek zespołu')}
          </span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-100 mt-1 w-full min-w-75 bg-white border border-slate-200 rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-64 overflow-y-auto overscroll-contain custom-scrollbar">
            
            <div 
              onClick={() => { onSelect('unassigned'); setIsOpen(false); }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-500 border-b border-slate-50 last:border-0"
            >
              <div className="w-6 h-6 shrink-0 bg-slate-50 rounded-full flex items-center justify-center">
                <User size={12} className="text-slate-400" />
              </div> 
              -- Brak przypisania --
            </div>

            {sortedMembers.map((m: any, index: number) => {
              const p = m.profiles
              const isSelected = m.user_id === selectedId
              
              const level = m.calculatedLevel
              const taskCount = m.calculatedTaskCount

              const isRecommended = index === 0 && members.length > 0;

              return (
                <div
                  key={m.user_id}
                  onClick={() => { onSelect(m.user_id); setIsOpen(false); }}
                  className={`flex items-center justify-between px-3 py-3 cursor-pointer text-sm group border-b border-slate-50 last:border-0 transition-colors ${
                    isRecommended ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        {p?.avatar_url ? (
                          <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User size={14} className="text-slate-400" />
                        )}
                      </div>
                      {isRecommended && (
                        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-0.5 rounded-full border-2 border-white shadow-sm">
                          <Sparkles size={10} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className={`truncate leading-none ${isSelected ? "font-bold text-blue-600" : "text-slate-700 font-medium"}`}>
                        {m.user_id === currentUserId ? 'Ty' : p?.full_name || 'Członek zespołu'}
                      </span>
                      {isRecommended && (
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1 flex items-center gap-1">
                          Najlepszy wybór
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <div 
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase border transition-colors ${
                        taskCount > 5 
                          ? 'bg-red-50 text-red-600 border-red-200 group-hover:bg-red-600 group-hover:text-white' // Czerwony alert jeśli ktoś jest przeciążony (np. > 5 zadań)
                          : 'bg-slate-100 text-slate-500 border-slate-200 group-hover:bg-white'
                      }`}
                      title="Aktywne zadania"
                    >
                      <ListTodo size={10} />
                      {taskCount}
                    </div>

                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-black uppercase border border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors">
                      <Zap size={10} className={level > 0 ? "fill-current" : ""} />
                      LVL {level}
                    </div>
                    
                    {isSelected && <Check size={16} className="text-blue-600 shrink-0 ml-1" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}