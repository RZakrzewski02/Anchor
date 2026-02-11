import Link from 'next/link'
import { Anchor, ArrowLeft } from 'lucide-react'
import { resetPassword } from './actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Zapomniałeś hasła?</h1>
          <p className="text-slate-500 mt-2 font-medium">Wpisz swój email, aby otrzymać link do resetowania.</p>
        </div>

        {/* Kontener formularza */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          {params.success ? (
            <div className="text-center py-4">
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 border border-blue-100 font-semibold">
                <strong>Link wysłany!</strong> Sprawdź swoją skrzynkę e-mail, aby kontynuować.
              </div>
              <Link href="/login" className="flex items-center justify-center gap-2 text-blue-600 font-bold hover:underline cursor-pointer">
                <ArrowLeft size={16} /> Wróć do logowania
              </Link>
            </div>
          ) : (
            <form action={resetPassword} className="flex flex-col gap-5">
              {params.error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 font-bold">
                  {params.error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-800 tracking-tight">Adres Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="twoj@email.com"
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 active:scale-[0.98] cursor-pointer"
              >
                Wyślij link do resetowania
              </button>

              <div className="text-center mt-2">
                <Link href="/login" className="text-sm text-slate-600 font-bold hover:text-blue-600 transition-colors cursor-pointer">
                  Anuluj i wróć do logowania
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}