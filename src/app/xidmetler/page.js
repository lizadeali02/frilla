'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

const SIRALAMA = [
  { key: 'newest', label: 'Ən yeni' },
  { key: 'price_asc', label: 'Qiymət: aşağıdan yuxarı' },
  { key: 'price_desc', label: 'Qiymət: yuxarıdan aşağı' },
]

function XidmetlerContent() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [gigs, setGigs] = useState([])
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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
    }
    setLoadingUser(false)
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.filter((g) => !activeOnly || g.profiles?.availability === 'active').map((gig) => {
                const freelancer = gig.profiles
                const fInitials = (freelancer?.full_name || '?')
                  .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

                const coverImage = gig.gig_images && gig.gig_images.length > 0
                  ? [...gig.gig_images].sort((a, b) => a.sort_order - b.sort_order)[0].image_url
                  : null

                return (
                  <a
                    href={"/gig/" + gig.id}
                    key={gig.id}
                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden block"
                  >
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={gig.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
                        {gig.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {gig.description}
                      </p>

                      {freelancer && (
                        <a
                          href={"/freelancer/" + freelancer.id}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2.5 mb-4 group/avatar"
                        >
                          {freelancer.avatar_url ? (
                            <img src={freelancer.avatar_url} alt={freelancer.full_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                              {fInitials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-gray-700 font-medium group-hover/avatar:text-purple-700 transition-colors truncate">
                              {freelancer.full_name}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              ⭐ Yeni satıcı
                              {freelancer.availability && (
                                <span className={`w-1.5 h-1.5 rounded-full ml-1 ${
                                  freelancer.availability === 'active' ? 'bg-green-500' :
                                  freelancer.availability === 'busy' ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                              )}
                            </p>
                          </div>
                        </a>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Başlanğıc qiymət</span>
                        <span className="text-lg font-semibold text-purple-700">
                          {gig.price} AZN
                        </span>
                      </div>
                    </div>
                  </a>
                )
              })}
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