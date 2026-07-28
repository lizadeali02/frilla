'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Giris() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setLoading(false)
      setError('E-poçt və ya şifrə yanlışdır')
      return
    }

    const pendingProfileRaw = localStorage.getItem('pendingProfile')
    if (pendingProfileRaw && data.user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle()

      if (!existingProfile) {
        const pendingProfile = JSON.parse(pendingProfileRaw)
        await supabase.from('profiles').insert({
          id: data.user.id,
          ...pendingProfile,
        })
      }
      localStorage.removeItem('pendingProfile')
    }

    setLoading(false)
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-white antialiased grid md:grid-cols-2">
      <div className="relative hidden md:block overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80"
          alt="Frila"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-purple-900/20 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto brightness-0 invert" />
          </a>
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2 leading-tight">
              Xoş gəlmisən
            </h2>
            <p className="text-white/80 text-lg">
              Hesabına daxil ol və işinə davam et
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <a href="/" className="md:hidden flex items-center justify-center mb-10">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>

          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Daxil ol
          </h1>
          <p className="text-gray-500 mb-8">
            Hesabına daxil olmaq üçün məlumatlarını gir
          </p>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
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

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 font-medium">Şifrə</label>
                <a href="/sifre-unutdum" className="text-xs text-purple-700 hover:underline">
                  Şifrəni unutdun?
                </a>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Şifrənizi daxil edin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-purple-700 text-white py-2.5 rounded-xl font-medium hover:bg-purple-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Gözləyin...' : 'Daxil ol'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Hesabın yoxdur? <a href="/qeydiyyat" className="text-purple-700 font-medium hover:underline">Qeydiyyatdan keç</a>
          </p>
        </div>
      </div>
    </main>
  )
}