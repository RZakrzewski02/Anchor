'use client'

import { useState } from 'react'
import { updateName } from './actions'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function AccountForm({ initialFirstName, initialLastName }: any) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(fd: FormData) {
    setLoading(true)
    setMessage(null)
    const res = await updateName(fd)
    setLoading(false)
    
    if (res.error) setMessage({ type: 'error', text: res.error })
    else setMessage({ type: 'success', text: res.success! })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Imię</label>
          <input 
            name="firstName" 
            defaultValue={initialFirstName}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Nazwisko</label>
          <input 
            name="lastName" 
            defaultValue={initialLastName}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      {message && (
        <div className={`text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message.type === 'success' && <CheckCircle2 size={16} />}
          {message.text}
        </div>
      )}

      <button 
        disabled={loading}
        className="bg-slate-900 text-white font-bold px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Zapisz zmiany
      </button>
    </form>
  )
}