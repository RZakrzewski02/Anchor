'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Loader2, User } from 'lucide-react'

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null | undefined
}

export default function AvatarUpload({ userId, avatarUrl }: AvatarUploadProps) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      setIsUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      router.refresh()

    } catch (error) {
      console.error('Błąd uploadu:', error)
      alert('Nie udało się zmienić zdjęcia.')
      setPreviewUrl(avatarUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDivClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        onClick={handleDivClick}
        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 group transition-all ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-blue-100'}`}
      >
        {previewUrl ? (
          <img 
            key={previewUrl} 
            src={previewUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <User size={48} />
          </div>
        )}
        
        {!isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="text-white" size={24} />
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}
        
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          onChange={handleFileChange}
          className="hidden" 
        />
      </div>

      {isUploading && (
        <span className="text-xs font-bold text-blue-600 animate-pulse">
          Zapisywanie w chmurze...
        </span>
      )}
    </div>
  )
}