'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { Github, Loader2, Unplug, CheckCircle2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GithubConnect({ 
  isConnected, 
  identity 
}: { 
  isConnected: boolean, 
  identity?: any
}) {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = async () => {
    setLoading(true)
    const { error } = await supabase.auth.linkIdentity({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings/account`,
        queryParams: {
          prompt: 'consent',
        }
      }
    })

    if (error) {
      alert('Błąd połączenia z GitHub: ' + error.message)
      setLoading(false)
    }
  }

  const handleDisconnectClick = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (!loading) setIsModalOpen(false)
  }

  const confirmDisconnect = async () => {
    if (!identity) return 
    
    setLoading(true)
    const { error } = await supabase.auth.unlinkIdentity(identity) 
    
    if (error) {
      alert('Błąd podczas odłączania konta: ' + error.message)
      setLoading(false)
    } else {
      setIsModalOpen(false)
      router.refresh() 
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-5 border border-slate-200 rounded-xl bg-slate-50 transition-all hover:border-slate-300">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl shadow-sm text-white ${isConnected ? 'bg-slate-900' : 'bg-slate-300'}`}>
            <Github size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              GitHub 
              {isConnected && <CheckCircle2 size={14} className="text-emerald-500" />}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {isConnected 
                ? 'Twoje konto jest połączone.' 
                : 'Połącz konto, aby móc śledzić aktywność w repozytoriach.'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={handleDisconnectClick}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Unplug size={16} />}
            Odłącz
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Github size={16} />}
            Połącz konto
          </button>
        )}
      </div>

      {isModalOpen && mounted && createPortal(
        <div 
          onClick={closeModal}
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 relative overflow-hidden text-slate-900"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-red-50/50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Unplug className="text-red-500" size={20} /> Odłącz konto
              </h3>
              <button 
                onClick={closeModal} 
                disabled={loading}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Czy na pewno chcesz odłączyć swoje konto <strong>GitHub</strong>? <br/><br/>
                Stracisz możliwość automatycznej integracji z repozytoriami, w tym śledzenia commitów i zamykania zadań. Tę operację zawsze możesz cofnąć, ponownie łącząc konta.
              </p>

              <div className="flex gap-3 pt-2 mt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button 
                  onClick={confirmDisconnect}
                  disabled={loading} 
                  className="flex-2 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Unplug size={18} />}
                  {loading ? 'Odłączanie...' : 'Tak, odłącz konto'}
                </button>
              </div>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </>
  )
}