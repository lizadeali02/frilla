'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Giris() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      {/* Sol tərəf - şəkil */}
      <div className="relative hidden md:block overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80"
          alt="Frila"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-purple-900/20 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12">
         
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

      {/* Sağ tərəf - form */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <a href="/" className="md:hidden block text-xl font-semibold text-gray-900 mb-10 text-center">
            Frila
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
              <label className="text-sm text-gray-600 font-medium">Şifrə</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Şifrənizi daxil edin"
              />
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