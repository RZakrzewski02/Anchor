import Link from 'next/link'
import { UserCircle, Settings } from 'lucide-react'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: 'Profil', href: '/dashboard/settings/profile', icon: UserCircle },
    { name: 'Konto', href: '/dashboard/settings/account', icon: Settings },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-white">
      {/* BOCZNY PANEL USTAWIEŃ */}
      <aside className="w-full md:w-64 border-r border-slate-100 p-6 space-y-2">
        <h2 className="text-xl font-bold text-slate-900 mb-6 px-2">Ustawienia</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* TREŚĆ USTAWIEŃ */}
      <main className="flex-1 bg-slate-50/30 p-8 md:p-12">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}