'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Qeydiyyat() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [skills, setSkills] = useState('')
  const [about, setAbout] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    const pendingProfile = {
      full_name: fullName,
      role: role,
    }
    if (role === 'freelancer') {
      pendingProfile.skills = skills
      pendingProfile.about = about
    }
    localStorage.setItem('pendingProfile', JSON.stringify(pendingProfile))

    if (data.session) {
      const profileData = { id: data.user.id, ...pendingProfile }
      await supabase.from('profiles').insert(profileData)
      localStorage.removeItem('pendingProfile')
    }

    setLoading(false)
    alert('Qeydiyyat uğurlu oldu! E-poçtunuzu yoxlayın (təsdiq linki göndərilib), sonra daxil olun.')
    router.push('/giris')
  }

  return (
    <main className="min-h-screen bg-white antialiased grid md:grid-cols-2">
      {/* Sol tərəf - şəkil */}
      <div className="relative hidden md:block overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
          alt="Frila"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-purple-900/20 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12">
          <a href="/" className="text-2xl font-semibold text-white tracking-tight">
            Frila
          </a>
          <div>
            <h2 className="text-3xl font-semibold text-white mb-2 leading-tight">
              Bacarığını<br />qazanca çevir
            </h2>
            <p className="text-white/80 text-lg">
              Azərbaycanın freelance icmasına qoşul
            </p>
          </div>
        </div>
      </div>

      {/* Sağ tərəf - form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <a href="/" className="md:hidden block text-xl font-semibold text-gray-900 mb-8 text-center">
            Frila
          </a>

          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Hesab yarat
          </h1>
          <p className="text-gray-500 mb-6">
            Bir neçə saniyəyə işə başla
          </p>

          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-600 font-medium mb-1.5 block">Mən kiməm?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2.5 rounded-xl border font-medium text-sm transition ${
                    role === 'customer'
                      ? 'border-purple-700 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Sifarişçiyəm
                </button>
                <button
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`py-2.5 rounded-xl border font-medium text-sm transition ${
                    role === 'freelancer'
                      ? 'border-purple-700 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Freelanserəm
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Ad Soyad</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Adınız Soyadınız"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Ən azı 6 simvol"
              />
            </div>

            {role === 'freelancer' && (
              <>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Bacarıqlarım</label>
                  <input
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Məs: Qrafik dizayn, Video montaj"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-medium">Haqqımda</label>
                  <textarea
                    required
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={3}
                    className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                    placeholder="Özün və təcrübən haqqında qısa məlumat"
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-purple-700 text-white py-2.5 rounded-xl font-medium hover:bg-purple-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Gözləyin...' : 'Qeydiyyatdan keç'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Artıq hesabın var? <a href="/giris" className="text-purple-700 font-medium hover:underline">Daxil ol</a>
          </p>
        </div>
      </div>
    </main>
  )
}