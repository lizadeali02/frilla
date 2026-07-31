'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Izlediklerim() {
  const [freelancers, setFreelancers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/giris')
      return
    }

    const { data: follows } = await supabase
      .from('freelancer_follows')
      .select('freelancer_id, created_at')
      .eq('follower_id', user.id)
      .order('created_at', { ascending: false })

    if (!follows || follows.length === 0) {
      setFreelancers([])
      setLoading(false)
      return
    }

    const ids = follows.map((f) => f.freelancer_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', ids)

    const ordered = ids.map((id) => profiles?.find((p) => p.id === id)).filter(Boolean)
    setFreelancers(ordered)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white antialiased">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
          <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px]">
            <a href="/xidmetler" className="text-gray-500 hover:text-gray-900 transition-colors">Xidmətlər</a>
            <a href="/profilim" className="text-gray-500 hover:text-gray-900 transition-colors">Profilim</a>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">İzlədiklərim</h1>

        {loading ? (
          <p className="text-gray-400">Yüklənir...</p>
        ) : freelancers.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-16 text-center">
            <p className="text-gray-500 mb-1">Hələ heç kimi izləmirsiniz.</p>
            <a href="/xidmetler" className="text-purple-700 text-sm font-medium hover:underline">Freelancerlərə bax</a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {freelancers.map((f) => (
              <a
                key={f.id}
                href={'/freelancer/' + f.id}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition"
              >
                {f.avatar_url ? (
                  <img src={f.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-700 text-white flex items-center justify-center font-semibold flex-shrink-0">
                    {(f.full_name || '?')[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{f.full_name}</p>
                  {f.availability && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        f.availability === 'active' ? 'bg-green-500' :
                        f.availability === 'busy' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-gray-500">
                        {f.availability === 'active' ? 'Aktiv' : f.availability === 'busy' ? 'Məşğul' : 'Məzuniyyətdə'}
                      </span>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}