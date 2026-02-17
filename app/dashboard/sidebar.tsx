'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Anchor, LayoutDashboard, FolderKanban, Settings, LogOut, Menu, X, User, Bell, Users } from 'lucide-react'
import { signOut } from './actions'

// Definicja typu profilu zgodna z tym, co zwraca Supabase
type UserProfile = {
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  avatar_url?: string | null
  email?: string | null
} | null

type SidebarProps = {
  userEmail: string | undefined
  userProfile: UserProfile
  unreadCount: number // NOWE: Liczba nieprzeczytanych powiadomień
}

export default function Sidebar({ userEmail, userProfile, unreadCount }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'Projekty', icon: FolderKanban },
    { href: '/dashboard/friends', label: 'Znajomi', icon: Users},
    { href: '/dashboard/notifications', label: 'Powiadomienia', icon: Bell, badge: unreadCount },
    { href: '/dashboard/settings', label: 'Ustawienia', icon: Settings },
  ]

  // LOGIKA WYŚWIETLANIA NAZWY:
  const displayName = userProfile?.full_name || 
    (userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}`.trim() : null) || 
    userEmail?.split('@')[0] || 'Użytkownik'

  // LOGIKA AWATARA:
  const avatarUrl = userProfile?.avatar_url

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Anchor className="text-blue-600" size={24} />
          <span className="font-bold text-slate-900">Anchor</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600">
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-full md:flex-none
      `}>
        
        {/* LOGO */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800 h-16 shrink-0">
          <div className="flex items-center gap-2">
            <Anchor className="text-blue-400" size={24} />
            <span className="text-xl font-bold tracking-tight text-white">Anchor</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer group ${
                isActive(item.href) 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="relative">
                <item.icon size={18} className={isActive(item.href) ? 'text-white' : 'group-hover:text-blue-400'} /> 
                
                {/* NOWE: Wyświetlanie badge'a z liczbą powiadomień */}
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-slate-900">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* SEKCJA UŻYTKOWNIKA (PROFIL) */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900 shrink-0">
          
          <Link 
            href="/dashboard/settings/profile" 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors group cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            {/* AVATAR */}
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-blue-500 transition-colors">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="font-bold text-slate-300 text-sm flex items-center justify-center w-full h-full">
                  {(userProfile?.first_name?.[0] || userEmail?.charAt(0) || 'U').toUpperCase()}
                </div>
              )}
            </div>

            {/* DANE TEKSTOWE */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                {displayName}
              </span>
              <span className="text-xs text-slate-400 truncate" title={userEmail}>
                {userEmail}
              </span>
            </div>
          </Link>

          {/* WYLOGUJ */}
          <form action={signOut}>
            <button className="w-full flex items-center gap-3 px-2 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider">
              <LogOut size={14} /> Wyloguj
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}