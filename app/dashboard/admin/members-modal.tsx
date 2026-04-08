'use client'

import { useState } from 'react'
import { Users, X, Loader2, Shield, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MembersModal({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const openModal = async () => {
    setIsOpen(true)
    setIsLoading(true)

    try {
      // KROK 1: Pobieramy członków projektu
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)

      if (membersError) throw membersError

      if (membersData && membersData.length > 0) {
        // KROK 2: Wyciągamy z wyników same numery user_id (żeby wiedzieć, kogo szukać)
        const userIds = membersData.map((m) => m.user_id)

        // KROK 3: Pobieramy tylko te profile, które należą do członków tego projektu
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name')
          .in('id', userIds) // .in() działa jak SQL-owe WHERE id IN (...)

        if (profilesError) throw profilesError

        // KROK 4: Łączymy dane w jedną tablicę, którą zrozumie nasz interfejs (Modal)
        const mergedMembers = membersData.map((member) => {
          // Szukamy profilu pasującego do tego członka
          const profile = profilesData?.find((p) => p.id === member.user_id)
          return {
            ...member,
            profiles: profile || null // Doklejamy dane profilu pod kluczem 'profiles'
          }
        })

        setMembers(mergedMembers)
      } else {
        // Jeśli projekt nie ma członków
        setMembers([])
      }
    } catch (err: any) {
      console.error("Błąd podczas pobierania danych:", err)
      alert("Wystąpił błąd podczas ładowania użytkowników.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRole = async (memberId: string, currentRole: string) => {
    const newRole = currentRole === 'manager' ? 'member' : 'manager'
    
    // Optymistyczna aktualizacja UI (żeby użytkownik nie musiał czekać na odświeżenie)
    setMembers(current => 
      current.map(m => m.id === memberId ? { ...m, role: newRole } : m)
    )

    // Aktualizacja w bazie danych
    await supabase
      .from('project_members')
      .update({ role: newRole })
      .eq('id', memberId)
      
    router.refresh()
  }

  return (
    <>
      <button
        onClick={openModal}
        className="cursor-pointer flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        title="Zarządzaj użytkownikami"
      >
        <Users className="w-4 h-4" />
        Użytkownicy
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg text-gray-900">
                Użytkownicy w: {projectName}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : members.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Brak przypisanych użytkowników.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div>
                        {/* Wyświetlanie danych z połączonej tabeli profiles */}
                        <p className="font-medium text-gray-900 text-sm">
                          {member.profiles?.full_name || 
                           (member.profiles?.first_name ? `${member.profiles.first_name} ${member.profiles.last_name || ''}` : null) || 
                           'Nieznany Użytkownik'}
                        </p>
                        <p className="text-xs text-gray-500">ID: {member.user_id.substring(0, 8)}...</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                          member.role === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {member.role === 'manager' ? <Shield className="w-3 h-3"/> : <User className="w-3 h-3"/>}
                          {member.role}
                        </span>
                        
                        <button
                          onClick={() => toggleRole(member.id, member.role)}
                          className="cursor-pointer px-2 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Zmień rolę
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}