'use client'

export default function Roadmap({ tasks }: { tasks: any[] }) {
  // Filtrujemy tylko zadania z datami
  const datedTasks = tasks.filter(t => t.start_date && t.end_date).sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )

  if (datedTasks.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm italic">
        Dodaj daty "Start" i "Koniec" do zadań, aby zobaczyć roadmapę.
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 overflow-x-auto">
      <div className="min-w-200 space-y-4">
        {datedTasks.map(task => {
          const start = new Date(task.start_date).getTime()
          const end = new Date(task.end_date).getTime()
          const duration = Math.max(1, (end - start) / (1000 * 60 * 60 * 24))
          
          return (
            <div key={task.id} className="flex items-center gap-4">
              <div className="w-48 text-sm font-bold text-slate-700 truncate">{task.title}</div>
              <div className="flex-1 bg-slate-50 h-8 rounded-lg relative overflow-hidden border border-slate-100">
                {/* Pasek postępu - długość zależna od duration */}
                <div 
                  className={`absolute h-full rounded-md shadow-sm flex items-center px-2 text-[9px] font-bold text-white transition-all ${
                    task.status === 'done' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, duration * 5)}%`, // Prosty mnożnik szerokości
                    left: `10%` // Tutaj można dodać logikę przesunięcia względem startu sprintu
                  }}
                >
                  {duration} dni
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}