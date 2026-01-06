import Link from 'next/link';
import { Anchor } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nawigacja */}
      <nav className="p-6 flex justify-between items-center bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 font-bold text-2xl text-slate-900">
          <Anchor className="text-blue-600" size={32} />
          <span>Anchr</span>
        </div>
        <Link 
          href="/login" 
          className="px-5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
        >
          Zaloguj się
        </Link>
      </nav>

      {/* Sekcja Hero */}
      <main className="grow flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Zakotwicz swoje projekty <br /> 
          <span className="text-blue-600">w jednym miejscu.</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mb-10">
          Anchr to najszybsze narzędzie do zarządzania zadaniami dla Twojego zespołu. 
          Proste, stabilne i gotowe na każde wyzwanie.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/register"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Zacznij za darmo
          </Link>
        </div>
      </main>

      {/* Stopka */}
      <footer className="p-8 text-center text-slate-400 text-sm">
        © 2025 Anchor App. Wszystkie prawa zastrzeżone.
      </footer>
    </div>
  );
}