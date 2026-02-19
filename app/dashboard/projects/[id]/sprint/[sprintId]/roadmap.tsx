'use client'

import { useMemo } from 'react'
import { format, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, startOfDay } from 'date-fns'
import { pl } from 'date-fns/locale'

export default function Roadmap({ tasks }: { tasks: any[] }) {
  // 1. Filtrujemy zadania z datami
  const datedTasks = useMemo(() => {
    return tasks
      .filter(t => t.start_date && t.end_date)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  }, [tasks])

  // 2. Obliczamy zakres osi czasu
  const timelineRange = useMemo(() => {
    if (datedTasks.length === 0) return null

    const starts = datedTasks.map(t => new Date(t.start_date).getTime())
    const ends = datedTasks.map(t => new Date(t.end_date).getTime())

    const minDate = startOfMonth(new Date(Math.min(...starts)))
    const maxDate = endOfMonth(new Date(Math.max(...ends)))

    const totalDays = differenceInDays(maxDate, minDate) + 1
    const months = eachMonthOfInterval({ start: minDate, end: maxDate })

    return { minDate, maxDate, totalDays, months }
  }, [datedTasks])

  if (!timelineRange || datedTasks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm italic">
        Brak zadań z datami startu i końca.
      </div>
    )
  }

  const { minDate, maxDate, totalDays, months } = timelineRange
  const today = startOfDay(new Date())

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm text-slate-900">
      <div className="overflow-x-auto">
        <div className="min-w-250 relative">
          
          {/* NAGŁÓWEK MIESIĘCY */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <div className="w-48 shrink-0 border-r border-slate-100 p-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
              Zadanie
            </div>
            <div className="flex-1 flex">
              {months.map((month, idx) => {
                const daysInMonth = differenceInDays(endOfMonth(month), startOfMonth(month)) + 1
                const widthPercent = (daysInMonth / totalDays) * 100
                return (
                  <div 
                    key={idx} 
                    className="p-3 text-center border-r border-slate-100 text-xs font-bold text-slate-600 truncate"
                    style={{ width: `${widthPercent}%` }}
                  >
                    {format(month, 'LLLL yyyy', { locale: pl })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* OŚ CZASU ZADANIA */}
          <div className="relative">
            {datedTasks.map((task) => {
              const taskStart = startOfDay(new Date(task.start_date))
              const taskEnd = startOfDay(new Date(task.end_date))
              
              const offsetDays = differenceInDays(taskStart, minDate)
              const durationDays = differenceInDays(taskEnd, taskStart) + 1
              
              const leftPos = (offsetDays / totalDays) * 100
              const widthSize = (durationDays / totalDays) * 100

              return (
                <div key={task.id} className="flex items-center border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <div className="w-48 shrink-0 p-4 border-r border-slate-100">
                    <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                    <span className="text-[10px] font-bold text-blue-500 uppercase">{task.specialization}</span>
                  </div>

                  <div className="flex-1 h-14 relative flex items-center px-0">
                    <div 
                      className={`h-8 rounded-lg shadow-sm flex items-center px-3 text-[10px] font-bold text-white whitespace-nowrap overflow-hidden group ${
                        task.status === 'done' ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ 
                        left: `${leftPos}%`, 
                        width: `${widthSize}%`,
                        position: 'absolute'
                      }}
                    >
                      {format(taskStart, 'd.MM')} - {format(taskEnd, 'd.MM')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}