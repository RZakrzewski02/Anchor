'use client'

import { useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { inviteMember } from './invite-actions'

export default function InviteForm({ projectId }: { projectId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setMessage(null)
    
    const result = await inviteMember(projectId, formData)
    
    if (result.error) {
      setMessage({ text: result.error, type: 'error' })
    } else {
      setMessage({ text: 'Dodano współpracownika!', type: 'success' })
      const form = document.querySelector('#invite-form') as HTMLFormElement
      form?.reset()
    }
    setIsLoading(false)
  }

  return (
    <div className="max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <UserPlus size={20} className="text-blue-600"/> 
        Zaproś do zespołu
      </h3>
      
      <form id="invite-form" action={handleSubmit} className="flex flex-col gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase">Adres Email Użytkownika</label>
          <input 
            name="email"
            type="email"
            required
            placeholder="np. jan@example.com"
            className="w-full px-3 py-2 border text-slate-500 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {message && (
          <p className={`text-sm font-medium ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message.text}
          </p>
        )}

        <button 
          disabled={isLoading}
          type="submit" 
          className="bg-slate-900 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-2"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLoading ? 'Dodawanie...' : 'Wyślij zaproszenie'}
        </button>
      </form>
    </div>
  )
}