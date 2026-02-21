import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Trophy, Star, Zap, User as UserIcon, Mail, CheckCircle2, FolderCheck } from 'lucide-react'

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: experience } = await supabase
    .from('user_exp')
    .select('specialization, exp')
    .eq('user_id', id)

  const { count: tasksCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('assignee_id', id)
    .eq('status', 'done')

  const { data: memberProjects } = await supabase
    .from('project_members')
    .select('projects!inner(status)')
    .eq('user_id', id)
    .eq('projects.status', 'completed')

  const projectsCount = memberProjects?.length || 0

  const specs = [
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'mobile developer', label: 'Mobile' },
    { id: 'game developer', label: 'Game Dev' }
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 font-sans">
      
      {/* KARTA PROFILU */}
      <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-slate-50 border-b border-slate-100" />
        <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <UserIcon size={48} className="text-slate-200" />
          )}
        </div>
        <div className="mt-6 text-center z-10">
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            {profile.first_name} {profile.last_name}
          </h2>
          <div className="flex items-center justify-center gap-2 text-slate-500 font-medium mt-1">
            <Mail size={14} className="text-blue-500" />
            <span className="text-sm">{profile.email || 'Email niedostępny'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition-colors">
          <CheckCircle2 className="text-blue-500" size={28} />
          <div>
            <p className="text-3xl font-black text-slate-900">{tasksCount || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ukończone zadania</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm flex flex-col items-center justify-center gap-2 hover:border-emerald-300 transition-colors">
          <FolderCheck className="text-emerald-500" size={28} />
          <div>
            <p className="text-3xl font-black text-slate-900">{projectsCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zakończone projekty</p>
          </div>
        </div>
      </div>

      {/* STATYSTYKI EXP I POZIOMY */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Star className="text-blue-500 fill-blue-500" size={18} />
          <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Poziomy Eksperckie</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {specs.map((spec) => {
            const stats = experience?.find(e => e.specialization === spec.id)
            const exp = stats?.exp || 0
            const level = Math.floor(exp / 100)
            const progress = exp % 100

            return (
              <div key={spec.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-blue-200 transition-all group">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Zap size={16} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{spec.label}</span>
                  </div>
                  <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">
                    LVL {level}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>{progress} / 100 EXP</span>
                    <span>Cel: Lvl {level + 1}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}