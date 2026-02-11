import { Anchor } from 'lucide-react'
import { updatePassword } from './actions'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full">
        {/* Nagłówek */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-200">
            <Anchor className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ustaw nowe hasło</h1>
          <p className="text-slate-500 mt-2 font-medium">Wprowadź nowe, bezpieczne hasło dla swojego konta.</p>
        </div>

        {/* Formularz */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <form action={updatePassword} className="flex flex-col gap-5">
            {params.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-bold">
                {params.error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 tracking-tight">Nowe hasło</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 tracking-tight">Potwierdź nowe hasło</label>
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
              Zapisz nowe hasło
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}