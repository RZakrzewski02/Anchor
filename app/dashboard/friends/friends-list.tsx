'use client'

import { useState } from 'react'
import { Search, UserPlus, Check, Loader2, User } from 'lucide-react'
import { searchUsers, sendFriendRequest } from './friends-actions'

export default function FriendsList({ currentUserId, existingFriendIds }: { currentUserId: string, existingFriendIds: string[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sentRequests, setSentRequests] = useState<string[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const users = await searchUsers(query)
    setResults(users)
    setLoading(false)
  }

  const handleAdd = async (userId: string) => {
    await sendFriendRequest(userId)
    setSentRequests([...sentRequests, userId])
  }

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative group">
        <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-blue-600 transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Szukaj osób..." 
          className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {/* Wyniki wyszukiwania */}
      {results.length > 0 && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Wyniki</p>
          {results.map(user => {
            const isFriend = existingFriendIds.includes(user.id)
            const isSent = sentRequests.includes(user.id)

            return (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-100">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.full_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                           <User size={14} />
                        </div>
                      )}
                   </div>
                   
                   <span className="text-xs font-bold text-slate-700 truncate">{user.full_name}</span>
                </div>
                
                {isFriend ? (
                  <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">Znajomy</span>
                ) : isSent ? (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Check size={10}/> Wysłano</span>
                ) : (
                  <button 
                    onClick={() => handleAdd(user.id)}
                    className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    title="Dodaj do znajomych"
                  >
                    <UserPlus size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}