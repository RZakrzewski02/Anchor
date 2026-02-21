import Link from 'next/link'
import { Anchor } from 'lucide-react'
import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-200">
            <Anchor className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Witaj ponownie</h1>
          <p className="text-slate-500 mt-2 font-medium">Zaloguj się do swojego konta Anchor</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <form action={login} className="flex flex-col gap-5">
            {params.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-bold">
                {params.error}
              </div>
            )}
            
            {params.message && (
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm border border-blue-100 font-semibold text-center">
                {params.message}
              </div>
            )}

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

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-800 tracking-tight">Hasło</label>
                <Link href="/forgot-password" size-sm="true" className="text-xs text-blue-600 font-bold hover:underline">
                  Zapomniałeś?
                </Link>
              </div>
              <input
                name="password"
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
              Zaloguj się
            </button>

            <p className="text-center text-sm text-slate-600 mt-4 font-medium">
              Nie masz jeszcze konta?{' '}
              <Link href="/register" className="text-blue-600 font-bold hover:underline cursor-pointer">
                Zarejestruj się
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}