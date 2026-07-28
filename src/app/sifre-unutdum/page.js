'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SifreUnutdum() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/yeni-sifre',
    })

    setLoading(false)

    if (error) {
      setError('Xəta baş verdi: ' + error.message)
      return
    }

    setSent(true)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-purple-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-sm">
        <a href="/" className="flex items-center justify-center mb-8">
          <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
        </a>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">E-poçtunu yoxla</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              <strong className="text-gray-700">{email}</strong> ünvanına şifrə bərpa linki göndərdik. E-poçt qutunuzu (spam daxil) yoxlayın.
            </p>
            <a href="/giris" className="inline-block mt-6 text-purple-700 text-sm font-medium hover:underline">
              Girişə qayıt
            </a>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Şifrəni unutdun?</h1>
            <p className="text-gray-500 mb-6 text-sm">
              E-poçtunu daxil et, sənə şifrə bərpa linki göndərək
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-600 font-medium">E-poçt</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="sen@example.com"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-purple-700 text-white py-2.5 rounded-xl font-medium hover:bg-purple-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Göndərilir...' : 'Bərpa linki göndər'}
              </button>
            </form>

            <a href="/giris" className="block text-center mt-6 text-sm text-gray-500 hover:text-purple-700">
              ← Girişə qayıt
            </a>
          </>
        )}
      </div>
    </main>
  )
}