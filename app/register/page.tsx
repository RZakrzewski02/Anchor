import Link from 'next/link'
import { Anchor } from 'lucide-react'
import { signup } from './actions'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full">
        {/* Sekcja nagłówka */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-200">
            <Anchor className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Załóż konto</h1>
          <p className="text-slate-500 mt-2 font-medium">Dołącz do aplikacji Anchor</p>
        </div>

        {/* Kontener formularza */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          {params.success ? (
            <div className="text-center py-4 text-slate-900">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 border border-green-100 font-semibold">
                <strong>Prawie gotowe!</strong> Sprawdź e-mail, aby potwierdzić konto.
              </div>
              <Link href="/login" className="text-blue-600 font-bold hover:underline cursor-pointer">
                Wróć do logowania
              </Link>
            </div>
          ) : (
            <form action={signup} className="flex flex-col gap-5">
              {params.error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-bold">
                  {params.error}
                </div>
              )}

              {/* Pole Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-800 tracking-tight">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="twoj@email.com"
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Pole Hasło */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-800 tracking-tight">Hasło</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Potwierdzenie Hasła */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-800 tracking-tight">Potwierdź hasło</label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 active:scale-[0.98] cursor-pointer"
              >
                Utwórz konto
              </button>

              <p className="text-center text-sm text-slate-600 mt-4 font-medium">
                Masz już konto?{' '}
                <Link href="/login" className="text-blue-600 font-bold hover:underline cursor-pointer">
                  Zaloguj się
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}