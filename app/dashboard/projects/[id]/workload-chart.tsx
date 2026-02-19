'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Rectangle } from 'recharts'
import { Activity, User } from 'lucide-react'

export default function WorkloadChart({ members }: { members: any[] }) {
  const data = members
    .map(m => {
      const name = m.profiles?.full_name || m.profiles?.first_name || 'Nieznany'
      return {
        name: name.split(' ')[0],
        fullName: name,
        tasks: m.taskCount || 0,
        avatarUrl: m.profiles?.avatar_url
      }
    })
    .sort((a, b) => b.tasks - a.tasks)

  const hasAnyTasks = data.some(d => d.tasks > 0)
  if (!hasAnyTasks) return null

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const user = data.find(d => d.name === payload.value);
    
    return (
      <g transform={`translate(${x},${y})`}>
        {/* ZMIANA 1: Zwiększono width, height oraz x, aby upewnić się, że tekst się zmieści */}
        <foreignObject x={-40} y={5} width={80} height={60}>
          <div className="flex flex-col items-center justify-start w-full h-full pt-1">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center mb-1.5 shrink-0 shadow-sm">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.name} />
              ) : (
                <User size={12} className="text-slate-400" />
              )}
            </div>
            {/* Tekst jest teraz wyżej, ma ciaśniejszy leading, by nie wypadać poza obszar */}
            <span className="text-[11px] font-bold text-slate-500 truncate w-full text-center leading-none">
              {payload.value}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 text-blue-600 rounded-xl">
          <Activity size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Obciążenie Zespołu</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">
            Aktywne zadania przypisane do członków
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={<CustomXAxisTick />}
            />
            <YAxis 
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-slate-900 text-white py-2 px-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3">
                      {data.avatarUrl ? (
                        <img src={data.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0" alt="Avatar" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600 shrink-0">
                          <User size={14} className="text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-slate-200 text-xs font-bold mb-0.5">{data.fullName}</p>
                        <p className="text-blue-400 text-xs font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                          {data.tasks} aktywnych zadań
                        </p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            
            <Bar 
              dataKey="tasks" 
              barSize={40}
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                const fillColor = payload.tasks > 5 ? '#ef4444' : (payload.tasks > 0 ? '#3b82f6' : '#e2e8f0');
                return (
                  <Rectangle 
                    x={x} 
                    y={y} 
                    width={width} 
                    height={height} 
                    fill={fillColor} 
                    radius={[6, 6, 6, 6]} 
                    className="transition-all duration-300" 
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}