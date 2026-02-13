'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AvatarUpload({ userId, avatarUrl }: { userId: string, avatarUrl?: string }) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/avatar.${fileExt}`

      // 1. Wgrywamy plik do Storage (nadpisujemy jeśli istnieje)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 2. Pobieramy publiczny URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 3. Aktualizujemy tabelę profiles o nowy URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError
      
      router.refresh()
    } catch (error: any) {
      alert('Błąd wgrywania: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group">
      <div className="w-32 h-32 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center relative">
        {avatarUrl ? (
          <img 
            src={`${avatarUrl}?t=${new Date().getTime()}`} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
            />
        ) : (
          <User size={48} className="text-slate-300" />
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <Loader2 className="text-white animate-spin" />
          </div>
        )}
      </div>

      <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-transform hover:scale-110">
        <Camera size={18} />
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={uploadAvatar} 
          disabled={uploading} 
        />
      </label>
    </div>
  )
}