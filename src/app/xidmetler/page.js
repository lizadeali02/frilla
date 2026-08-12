'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

const SIRALAMA = [
  { key: 'newest', label: 'Ən yeni' },
  { key: 'price_asc', label: 'Qiymət: aşağıdan yuxarı' },
  { key: 'price_desc', label: 'Qiymət: yuxarıdan aşağı' },
]

function GigCard({ gig, isLiked, onToggleLike }) {
  const [hoverIndex, setHoverIndex] = useState(0)
  const [hovering, setHovering] = useState(false)

  const freelancer = gig.profiles
  const fInitials = (freelancer?.full_name || '?')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const images = gig.gig_images && gig.gig_images.length > 0
    ? [...gig.gig_images].sort((a, b) => a.sort_order - b.sort_order)
    : []
  const currentImage = images.length > 0 ? images[hoverIndex % images.length]?.image_url : null

  const handleMouseMove = (e) => {
    if (images.length <= 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const segment = Math.floor((x / rect.width) * images.length)
    setHoverIndex(Math.min(Math.max(segment, 0), images.length - 1))
  }

  return (
    <a
      href={'/gig/' + gig.id}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden block"
    >
      <div
        className="relative aspect-[4/3] bg-gray-100 overflow-hidden"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => { setHovering(false); setHoverIndex(0) }}
        onMouseMove={handleMouseMove}
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt={gig.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
            <span className="text-purple-300 text-xs font-medium">Şəkil yoxdur</span>
          </div>
        )}

        {/* Bəyən düyməsi */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleLike(gig.id) }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
        >
          <svg
            className={`w-4 h-4 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
            fill={isLiked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Şəkil sürüşdürmə göstəricisi */}
        {hovering && images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${i === hoverIndex ? 'w-4 bg-white' : 'w-1 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3">
        {freelancer && (
          <div
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = '/freelancer/' + freelancer.id }}
            className="flex items-center gap-2 mb-2"
          >
            {freelancer.avatar_url ? (
              <img src={freelancer.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                {fInitials}
              </div>
            )}
            <span className="text-xs text-gray-600 font-medium truncate flex-1">{freelancer.full_name}</span>
            {freelancer.availability && (
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                freelancer.availability === 'active' ? 'bg-green-500' :
                freelancer.availability === 'busy' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
            )}
          </div>
        )}

        <h3 className="text-sm text-gray-800 mb-2 leading-snug line-clamp-2">
          {gig.title}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.368-2.446a1 1 0 00-1.176 0l-3.368 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
          </svg>
          <span className="text-xs font-semibold text-gray-800">Yeni</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-[11px] text-gray-400">Başlanğıc</span>
          <span className="text-sm font-semibold text-gray-900">
            {gig.price} AZN
          </span>
        </div>
      </div>
    </a>
  )
}

function XidmetlerContent() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [gigs, setGigs] = useState([])
  const [likedGigIds, setLikedGigIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [activeOnly, setActiveOnly] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [categories, setCategories] = useState([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    setCategories(data || [])
  }

  const loadNotifications = async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifications(data || [])
  }

  const markAsRead = async (notifId) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notifId)
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    setSearchInput(query)
    loadGigs(query, activeCategory, sortBy)
  }, [query, activeCategory, sortBy])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      loadNotifications(user.id)
      loadLikes(user.id)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
    }
    setLoadingUser(false)
  }

  const loadLikes = async (userId) => {
    const { data } = await supabase.from('gig_likes').select('gig_id').eq('user_id', userId)
    setLikedGigIds(new Set((data || []).map((l) => l.gig_id)))
  }

  const toggleLike = async (gigId) => {
    if (!user) {
      router.push('/giris')
      return
    }
    if (likedGigIds.has(gigId)) {
      await supabase.from('gig_likes').delete().eq('gig_id', gigId).eq('user_id', user.id)
      setLikedGigIds((prev) => {
        const next = new Set(prev)
        next.delete(gigId)
        return next
      })
    } else {
      await supabase.from('gig_likes').insert({ gig_id: gigId, user_id: user.id })
      setLikedGigIds((prev) => new Set(prev).add(gigId))
    }
  }

  const loadGigs = async (q, category, sort) => {
    setLoading(true)
    let request = supabase
      .from('gigs')
      .select('*, profiles(id, full_name, avatar_url, availability), gig_images(image_url, sort_order)')

    if (q) {
      request = request.or('title.ilike.%' + q + '%,description.ilike.%' + q + '%,category.ilike.%' + q + '%')
    }
    if (category) {
      request = request.eq('category', category)
    }

    if (sort === 'price_asc') {
      request = request.order('price', { ascending: true })
    } else if (sort === 'price_desc') {
      request = request.order('price', { ascending: false })
    } else {
      request = request.order('created_at', { ascending: false })
    }

    const { data, error } = await request

    if (!error) {
      setGigs(data || [])
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput) {
      router.push('/xidmetler?q=' + encodeURIComponent(searchInput))
    } else {
      router.push('/xidmetler')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-white antialiased">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
          <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px] overflow-x-auto whitespace-nowrap">
            <a href="/xidmetler" className="text-gray-900 font-medium">Xidmətlər</a>
            {!loadingUser && user && profile?.role === 'freelancer' && (
              <a href="/xidmet-elave-et" className="text-gray-500 hover:text-gray-900 transition-colors">Xidmət əlavə et</a>
            )}
            {loadingUser ? null : user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <div className="fixed top-16 right-4 left-4 sm:left-auto sm:right-6 sm:w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 max-h-[70vh] overflow-y-auto">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900 text-sm">Bildirişlər</h3>
                        </div>
                        {notifications.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-8">Bildiriş yoxdur</p>
                        ) : (
                          notifications.map((n) => (
                            <a
                              key={n.id}
                              href={n.link || '#'}
                              onClick={() => markAsRead(n.id)}
                              className={`block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${!n.read ? 'bg-purple-50/50' : ''}`}
                            >
                              <div className="flex items-start gap-2">
                                {!n.read && <span className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />}
                                <div className={!n.read ? '' : 'ml-4'}>
                                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                  {n.message && <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>}
                                </div>
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                <a href="/profilim" className="text-gray-500 hover:text-gray-900 transition-colors">Profilim</a>
                <button onClick={handleSignOut} className="px-4 py-1.5 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                  Çıxış
                </button>
              </>
            ) : (
              <>
                <a href="/giris" className="text-gray-500 hover:text-gray-900 transition-colors">Giriş</a>
                <a href="/qeydiyyat" className="px-4 py-1.5 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors">
                  Qeydiyyat
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-purple-50 via-white to-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-2">Xidmətlər</h1>
          <p className="text-gray-500 mb-8">Freelancerlərin təklif etdiyi xidmətlər arasından seç</p>

          <form onSubmit={handleSearch} className="max-w-lg">
            <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 p-1.5">
              <svg className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Hansı xidməti axtarırsan?"
                className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 min-w-0"
              />
              <button type="submit" className="px-5 py-2 bg-purple-700 text-white rounded-full font-medium hover:bg-purple-800 transition-colors flex-shrink-0">
                Axtar
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="border-b border-gray-100 sticky top-[65px] z-40 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="hidden md:flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('')}
              className={"px-4 py-1.5 rounded-full text-sm font-medium transition-all " + (activeCategory === '' ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
            >
              Hamısı
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={"px-4 py-1.5 rounded-full text-sm font-medium transition-all " + (activeCategory === cat.name ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="md:hidden px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border-none outline-none cursor-pointer w-full"
          >
            <option value="">Kateqoriya seç (Hamısı)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setActiveOnly((prev) => !prev)}
            className={"flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 " + (activeOnly ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Yalnız aktiv freelancerlər
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border-none outline-none cursor-pointer flex-shrink-0"
          >
            {SIRALAMA.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-6">
          {(query || activeCategory) && (
            <p className="text-gray-500 mb-6 text-sm">
              {gigs.length} nəticə tapıldı
              {query && <> — <strong className="text-gray-900">"{query}"</strong></>}
              {activeCategory && <> — <strong className="text-gray-900">{activeCategory}</strong></>}
            </p>
          )}

          {loading ? (
            <p className="text-gray-500">Yüklənir...</p>
          ) : gigs.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-16 text-center">
              <p className="text-gray-500 mb-1">Bu axtarışa uyğun xidmət tapılmadı.</p>
              <a href="/xidmetler" className="text-purple-700 text-sm font-medium hover:underline">Bütün xidmətlərə bax</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {gigs.filter((g) => !activeOnly || g.profiles?.availability === 'active').map((gig) => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  isLiked={likedGigIds.has(gig.id)}
                  onToggleLike={toggleLike}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default function Xidmetler() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Yüklənir...</div>}>
      <XidmetlerContent />
    </Suspense>
  )
}