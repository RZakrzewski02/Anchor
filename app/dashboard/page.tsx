import { Plus, FolderKanban } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Przegląd projektów</h1>
          <p className="text-slate-500 font-medium">Zarządzaj swoimi zadaniami w jednym miejscu.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-100">
          <Plus size={18} /> Nowy projekt
        </button>
      </header>
    </div>
  )
}