'use client'

import { useMemo } from 'react'

export default function Roadmap({ tasks }: { tasks: any[] }) {
  // 1. Filtrujemy i sortujemy zadania
  const datedTasks = useMemo(() => {
    return (tasks || [])
      .filter(t => t.start_date && t.end_date)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
  }, [tasks])

  // POMOCNICZE FUNKCJE ZASTĘPUJĄCE DATE-FNS:
  const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getEndOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const diffInDays = (end: Date, start: Date) => {
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatMonthHeader = (date: Date) => {
    const formatted = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatShortDate = (date: Date) => {
    return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // 2. Obliczamy zakres osi czasu
  const timelineRange = useMemo(() => {
    if (datedTasks.length === 0) return null

    const starts = datedTasks.map(t => new Date(t.start_date).getTime())
    const ends = datedTasks.map(t => new Date(t.end_date).getTime())

    const minDate = getStartOfMonth(new Date(Math.min(...starts)))
    const maxDate = getEndOfMonth(new Date(Math.max(...ends)))

    const totalDays = diffInDays(maxDate, minDate) + 1

    // Generujemy listę miesięcy
    const months = [];
    let current = new Date(minDate);
    while (current <= maxDate) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    return { minDate, maxDate, totalDays, months }
  }, [datedTasks])

  if (!timelineRange || datedTasks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm italic">
        Brak zadań z datami startu i końca.
      </div>
    )
  }

  const { minDate, totalDays, months } = timelineRange

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
                const daysInMonth = diffInDays(getEndOfMonth(month), getStartOfMonth(month)) + 1
                const widthPercent = (daysInMonth / totalDays) * 100
                return (
                  <div 
                    key={idx} 
                    className="p-3 text-center border-r border-slate-100 text-xs font-bold text-slate-600 truncate"
                    style={{ width: `${widthPercent}%` }}
                  >
                    {formatMonthHeader(month)}
                  </div>
                )
              })}
            </div>
          </div>

          {/* OŚ CZASU ZADANIA */}
          <div className="relative">
            {datedTasks.map((task) => {
              const taskStart = getStartOfDay(new Date(task.start_date))
              const taskEnd = getStartOfDay(new Date(task.end_date))
              
              const offsetDays = diffInDays(taskStart, minDate)
              const durationDays = diffInDays(taskEnd, taskStart) + 1
              
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
                      {formatShortDate(taskStart)} - {formatShortDate(taskEnd)}
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