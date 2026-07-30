'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useParams } from 'next/navigation'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export default function FreelancerProfile() {
  const [profile, setProfile] = useState(null)
  const [images, setImages] = useState([])
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ avgRating: 0, reviewCount: 0 })
  const [completedCount, setCompletedCount] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)
  const params = useParams()

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .eq('role', 'freelancer')
      .single()

    if (!profileData) {
      setLoading(false)
      return
    }

    setProfile(profileData)

    const { data: imagesData } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
    setImages(imagesData || [])

    const { data: gigsData } = await supabase
      .from('gigs')
      .select('*')
      .eq('user_id', params.id)
      .order('created_at', { ascending: false })
    setGigs(gigsData || [])

    const gigIdList = (gigsData || []).map((g) => g.id)
    if (gigIdList.length > 0) {
      const { data: allReviews } = await supabase
        .from('gig_reviews')
        .select('rating')
        .in('gig_id', gigIdList)
      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        setStats({ avgRating: avg, reviewCount: allReviews.length })
      }
    }

    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', params.id)
      .eq('status', 'completed')
    setCompletedCount(count || 0)

    const { data: { user: authUser } } = await supabase.auth.getUser()
    setCurrentUser(authUser)

    const { count: followers } = await supabase
      .from('freelancer_follows')
      .select('*', { count: 'exact', head: true })
      .eq('freelancer_id', params.id)
    setFollowerCount(followers || 0)

    if (authUser) {
      const { data: followData } = await supabase
        .from('freelancer_follows')
        .select('id')
        .eq('follower_id', authUser.id)
        .eq('freelancer_id', params.id)
        .maybeSingle()
      setIsFollowing(Boolean(followData))
    }

    setLoading(false)
  }

  const toggleFollow = async () => {
    if (!currentUser) {
      window.location.href = '/giris'
      return
    }
    setFollowLoading(true)
    if (isFollowing) {
      await supabase.from('freelancer_follows').delete().eq('follower_id', currentUser.id).eq('freelancer_id', params.id)
      setIsFollowing(false)
      setFollowerCount((c) => c - 1)
    } else {
      await supabase.from('freelancer_follows').insert({ follower_id: currentUser.id, freelancer_id: params.id })
      setIsFollowing(true)
      setFollowerCount((c) => c + 1)
    }
    setFollowLoading(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Yüklənir...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bu freelancer tapılmadı.</p>
          <a href="/xidmetler" className="text-purple-700 font-medium hover:underline">Xidmətlərə qayıt</a>
        </div>
      </main>
    )
  }

  const initials = (profile?.full_name || '?')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen bg-white antialiased">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
                    <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px] overflow-x-auto whitespace-nowrap">

            <a href="/xidmetler" className="text-gray-500 hover:text-gray-900 transition-colors">Xidmətlər</a>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="flex items-center gap-5">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-700 text-white flex items-center justify-center text-2xl font-semibold flex-shrink-0">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{profile.full_name}</h1>
                {stats.reviewCount === 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                    ⭐ Yeni Satıcı
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">Frila-ya qoşulub: {formatDate(profile.created_at)}</p>
              {profile.availability && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-2 h-2 rounded-full ${
                    profile.availability === 'active' ? 'bg-green-500' :
                    profile.availability === 'busy' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600 font-medium">
                    {profile.availability === 'active' ? 'Aktiv' :
                     profile.availability === 'busy' ? 'Məşğul' : 'Məzuniyyətdə'}
                  </span>
                </div>
              )}
              {stats.reviewCount > 0 ? (
                <p className="text-gray-600 text-sm mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-500 font-medium">★ {stats.avgRating.toFixed(1)}</span>
                  <span className="text-gray-400">({stats.reviewCount} rəy)</span>
                  <span className="text-gray-400">· {completedCount} tamamlanan sifariş</span>
                </p>
              ) : (
                <p className="text-gray-400 text-sm mt-0.5">Hələ rəy yoxdur</p>
              )}
              <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
            <span className="text-sm text-gray-500">{followerCount} izləyici</span>
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-purple-700 text-white hover:bg-purple-800'
              }`}
            >
              {isFollowing ? 'İzlənilir ✓' : '+ İzlə'}
            </button>
          </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Bacarıqlarım</h3>
              <p className="text-gray-800 text-[15px]">{profile.skills || '—'}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Təhsil</h3>
              <p className="text-gray-800 text-[15px]">{profile.education || 'Qeyd olunmayıb'}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Haqqımda</h3>
            <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line">{profile.about || '—'}</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
            <h3 className="font-semibold text-gray-900 mb-5">Portfolio</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <img key={img.id} src={img.image_url} alt="Portfolio" className="w-full h-32 object-cover rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-semibold text-gray-900 mb-5">Bu freelancerin xidmətləri</h3>
          {gigs.length === 0 ? (
            <p className="text-gray-400 text-sm">Hələ heç bir xidmət əlavə etməyib</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {gigs.map((gig) => (
                <a key={gig.id} href={"/gig/" + gig.id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition">
                  <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium mb-1.5">
                    {gig.category}
                  </span>
                  <h4 className="font-medium text-gray-900">{gig.title}</h4>
                  <p className="text-sm text-purple-700 font-semibold mt-1">{gig.price} AZN-dən</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}