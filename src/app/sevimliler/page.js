'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Sevimliler() {
  const [user, setUser] = useState(null)
  const [gigs, setGigs] = useState([])
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
    setUser(user)

    const { data: likesData } = await supabase
      .from('gig_likes')
      .select('gig_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!likesData || likesData.length === 0) {
      setGigs([])
      setLoading(false)
      return
    }

    const gigIds = likesData.map((l) => l.gig_id)
    const { data: gigsData } = await supabase
      .from('gigs')
      .select('*, profiles(id, full_name, avatar_url), gig_images(image_url, sort_order)')
      .in('id', gigIds)

    const ordered = gigIds.map((id) => gigsData?.find((g) => g.id === id)).filter(Boolean)
    setGigs(ordered)
    setLoading(false)
  }

  const removeFavorite = async (gigId) => {
    await supabase.from('gig_likes').delete().eq('gig_id', gigId).eq('user_id', user.id)
    setGigs((prev) => prev.filter((g) => g.id !== gigId))
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

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">Sevimlilər</h1>

        {loading ? (
          <p className="text-gray-400">Yüklənir...</p>
        ) : gigs.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-16 text-center">
            <p className="text-gray-500 mb-1">Hələ heç bir xidməti bəyənməmisiniz.</p>
            <a href="/xidmetler" className="text-purple-700 text-sm font-medium hover:underline">Xidmətlərə bax</a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => {
              const freelancer = gig.profiles
              const coverImage = gig.gig_images && gig.gig_images.length > 0
                ? [...gig.gig_images].sort((a, b) => a.sort_order - b.sort_order)[0].image_url
                : null

              return (
                <div key={gig.id} className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <button
                    onClick={() => removeFavorite(gig.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <a href={'/gig/' + gig.id} className="block">
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      {coverImage ? (
                        <img src={coverImage} alt={gig.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
                          <span className="text-purple-300 text-sm font-medium">Şəkil yoxdur</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium mb-3">
                        {gig.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">{gig.title}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        {freelancer?.avatar_url ? (
                          <img src={freelancer.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-semibold">
                            {(freelancer?.full_name || '?')[0]}
                          </div>
                        )}
                        <span className="text-sm text-gray-600">{freelancer?.full_name}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Başlanğıc qiymət</span>
                        <span className="text-lg font-semibold text-purple-700">{gig.price} AZN</span>
                      </div>
                    </div>
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}