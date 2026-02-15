'use client'

import { useState } from 'react'
import { updatePassword } from './actions'
import { Loader2, Lock } from 'lucide-react'

export default function PasswordForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(fd: FormData) {
    const newPass = fd.get('newPassword') as string
    const confirmPass = fd.get('confirmPassword') as string

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'Nowe hasła nie są identyczne' })
      return
    }

    setLoading(true)
    setMessage(null)
    const res = await updatePassword(fd)
    setLoading(false)

    if (res.error) setMessage({ type: 'error', text: res.error })
    else {
      setMessage({ type: 'success', text: res.success! })
      ;(document.getElementById('password-form') as HTMLFormElement).reset()
    }
  }

  return (
    <form id="password-form" action={handleSubmit} className="space-y-5">
      <div className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Stare hasło</label>
          <input 
            type="password" 
            name="oldPassword" 
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <hr className="border-slate-100" />
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Nowe hasło</label>
          <input 
            type="password" 
            name="newPassword" 
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Powtórz nowe hasło</label>
          <input 
            type="password" 
            name="confirmPassword" 
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      </div>

      {message && (
        <div className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message.text}
        </div>
      )}

      <button 
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm shadow-sm cursor-pointer"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        <Lock size={16} />
        Zmień hasło
      </button>
    </form>
  )
}