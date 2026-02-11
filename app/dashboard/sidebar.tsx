'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Anchor, LayoutDashboard, FolderKanban, Settings, LogOut, Menu, X } from 'lucide-react'
import { signOut } from '@/app/dashboard/actions'

type SidebarProps = {
  userEmail: string | undefined
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/projects', label: 'Projekty', icon: FolderKanban },
    { href: '/dashboard/settings', label: 'Ustawienia', icon: Settings },
  ]

  return (
    <>
      {/* 1. PRZYCISK HAMBURGERA (Widoczny tylko na mobile: md:hidden) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <Anchor className="text-blue-600" size={24} />
          <span className="font-bold text-slate-900">Anchor</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600">
          <Menu size={24} />
        </button>
      </div>

      {/* 2. TŁO PRZYCIEMNIAJĄCE (Overlay na mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. SIDEBAR WŁAŚCIWY */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen
      `}>
        {/* Nagłówek Sidebaru */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800 h-16 md:h-auto">
          <div className="flex items-center gap-2">
            <Anchor className="text-blue-400" size={24} />
            <span className="text-xl font-bold tracking-tight text-white">Anchor</span>
          </div>
          {/* Przycisk zamknięcia tylko na mobile */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Nawigacja */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
              <item.icon size={18} className={isActive(item.href) ? 'text-white' : 'group-hover:text-blue-400'} /> 
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Stopka użytkownika */}
        <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-900">
          <div className="px-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase border border-slate-700">
              {userEmail?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{userEmail}</span>
            </div>
          </div>
          <form action={signOut}>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer font-bold text-sm">
              <LogOut size={18} /> Wyloguj się
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}