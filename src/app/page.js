'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const KATEQORIYALAR = [
  {
    name: 'Qrafik dizayn',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Proqramlaşdırma',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Video montaj',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Digital marketinq',
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Yazı və tərcümə',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Musiqi və səs',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
  },
]

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useScrollReveal()

  const handleSearch = (e) => {
    e.preventDefault()
    router.push(`/xidmetler${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
  }

  useEffect(() => {
    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        loadProfile(session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      loadProfile(user)
    } else {
      setLoading(false)
    }
  }

  const loadProfile = async (user) => {
    setUser(user)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profileData)
    loadNotifications(user.id)
    setLoading(false)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-white antialiased overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
          <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px] overflow-x-auto whitespace-nowrap">
            <a href="/xidmetler" className="text-gray-500 hover:text-gray-900 transition-colors">
              Xidmətlər
            </a>

            {!loading && user && profile?.role === 'freelancer' && (
              <a href="/xidmet-elave-et" className="text-gray-500 hover:text-gray-900 transition-colors">
                Xidmət əlavə et
              </a>
            )}

            {loading ? null : user ? (
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
                <a href="/sevimliler" className="text-gray-500 hover:text-gray-900 transition-colors">Sevimlilər</a>
                <a href="/mesajlarim" className="text-gray-500 hover:text-gray-900 transition-colors">Mesajlarım</a>

                <a href="/profilim" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Profilim
                </a>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-1.5 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Çıxış
                </button>
              </>
            ) : (
              <>
                <a href="/giris" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Giriş
                </a>
                <a
                  href="/qeydiyyat"
                  className="px-4 py-1.5 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors"
                >
                  Qeydiyyat
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50" />
        <div className="blob absolute top-10 -left-20 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="blob absolute bottom-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span
              className="pulse-badge animate-fade-up inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6"
              style={{ animationDelay: '0s' }}
            >
              🇦🇿 Azərbaycanın #1 freelance platforması
            </span>
            <h1
              className="animate-fade-up text-4xl md:text-6xl font-semibold text-gray-900 tracking-tight leading-[1.1] mb-6"
              style={{ animationDelay: '0.1s' }}
            >
              Ən yaxşı<br />
              <span className="gradient-text">freelancerlərlə</span><br />
              işini bağla
            </h1>
            <p
              className="animate-fade-up text-lg text-gray-500 mb-8 leading-relaxed max-w-lg"
              style={{ animationDelay: '0.2s' }}
            >
              Dizayndan proqramlaşdırmaya, video montajdan marketinqə qədər —
              minlərlə peşəkar bir kliklə əlində.
            </p>

            <form
              onSubmit={handleSearch}
              className="animate-fade-up mb-6"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center bg-white rounded-full shadow-lg shadow-gray-200/50 border border-gray-200 p-1.5 max-w-lg transition-shadow hover:shadow-xl focus-within:shadow-xl focus-within:ring-2 focus-within:ring-purple-200">
                <svg className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hansı xidməti axtarırsan?"
                  className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 min-w-0"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 text-white rounded-full font-medium hover:bg-purple-800 transition-colors flex-shrink-0"
                >
                  Axtar
                </button>
              </div>
            </form>

            <div
              className="animate-fade-up flex gap-3 flex-wrap"
              style={{ animationDelay: '0.4s' }}
            >
              <a
                href="/xidmetler"
                className="px-7 py-3 bg-purple-700 text-white rounded-full font-medium hover:bg-purple-800 transition-all hover:scale-[1.03] shadow-lg shadow-purple-200"
              >
                Xidmət axtar
              </a>
              <a
                href="/qeydiyyat"
                className="px-7 py-3 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-all hover:scale-[1.03] border border-gray-200"
              >
                Freelancer ol
              </a>
            </div>
          </div>

          <div
            className="animate-fade-up relative hidden md:block"
            style={{ animationDelay: '0.25s' }}
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-200 to-purple-50 rounded-3xl blur-2xl opacity-60" />
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
              alt="Freelancer işləyir"
              className="relative rounded-3xl shadow-2xl w-full h-[420px] object-cover transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>
        </div>
      </section>

      {/* Nə üçün Frila? */}
      <section className="reveal py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 tracking-tight mb-16">
            Nə üçün Frila?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Təhlükəsiz</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Bütün ödənişlər qorunur, iş tamamlanana qədər vəsait təhlükəsizdir
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Sürətli</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Dəqiqələr içində xidmət tap, freelancerlə birbaşa əlaqə saxla
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Keyfiyyətli</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Yoxlanılmış freelancerlər, real portfolio və bacarıqlarla
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Populyar kateqoriyalar */}
      <section className="reveal py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 tracking-tight mb-4">
            Populyar kateqoriyalar
          </h2>
          <p className="text-center text-gray-500 mb-14">
            Ehtiyacına uyğun sahəni seç
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {KATEQORIYALAR.map((cat) => (
              <a
                key={cat.name}
                href="/xidmetler"
                className="group relative rounded-2xl overflow-hidden h-40 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-semibold text-lg transition-transform duration-300 group-hover:translate-x-1">
                  {cat.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Necə işləyir */}
      <section className="reveal py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <span className="block text-center text-purple-700 text-sm font-semibold tracking-wide uppercase mb-3">
            Sadə proses
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-gray-900 tracking-tight mb-16">
            Necə işləyir?
          </h2>

          <div className="relative grid md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200" />

            <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="w-16 h-16 bg-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200 relative z-10 transition-transform duration-300 hover:rotate-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-purple-400 tracking-wide">ADDIM 1</span>
              <h3 className="font-semibold text-lg text-gray-900 mt-1 mb-2">Xidmət tap</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Minlərlə xidmət arasından ehtiyacına uyğun olanı seç
              </p>
            </div>

            <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="w-16 h-16 bg-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200 relative z-10 transition-transform duration-300 hover:rotate-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-purple-400 tracking-wide">ADDIM 2</span>
              <h3 className="font-semibold text-lg text-gray-900 mt-1 mb-2">Sifariş ver</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Freelancer ilə birbaşa əlaqə saxla və sifarişini ver
              </p>
            </div>

            <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="w-16 h-16 bg-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-200 relative z-10 transition-transform duration-300 hover:rotate-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l-1 10H6L5 11z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-purple-400 tracking-wide">ADDIM 3</span>
              <h3 className="font-semibold text-lg text-gray-900 mt-1 mb-2">İndi al</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Bəyəndiyin paketi seç, birbaşa al və işinə başlasın
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="reveal py-24 px-6">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-800 via-purple-700 to-purple-900 px-10 py-16 md:py-20 text-center">
          <div className="blob absolute -top-24 -right-24 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="blob absolute -bottom-24 -left-24 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl" style={{ animationDelay: '4s' }} />

          <div className="relative">
            <span className="inline-block px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              Freelancerlər üçün
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
              Bacarığını qazanca çevir
            </h2>
            <p className="text-purple-100 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
              Frila-da freelancer kimi qeydiyyatdan keç, öz xidmətini əlavə et
              və ilk sifarişini bu gün qazan.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/qeydiyyat" className="px-8 py-3.5 bg-white text-purple-700 rounded-full font-medium hover:bg-purple-50 transition-all hover:scale-[1.03] shadow-xl">İndi başla</a>
              <a href="/xidmetler" className="px-8 py-3.5 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all">Xidmətlərə bax</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center">
              <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
            </a>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Azərbaycanın freelance platforması
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Kateqoriyalar</h4>
            <ul className="flex flex-col gap-2.5">
              {KATEQORIYALAR.map((cat) => (
                <li key={cat.name}>
                  <a href="/xidmetler" className="text-gray-500 text-sm hover:text-purple-700 transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Platforma</h4>
            <ul className="flex flex-col gap-2.5">
              <li><a href="/xidmetler" className="text-gray-500 text-sm hover:text-purple-700 transition-colors">Xidmətlər</a></li>
              <li><a href="/qeydiyyat" className="text-gray-500 text-sm hover:text-purple-700 transition-colors">Freelancer ol</a></li>
              <li><a href="/giris" className="text-gray-500 text-sm hover:text-purple-700 transition-colors">Daxil ol</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Haqqımızda</h4>
            <ul className="flex flex-col gap-2.5">
              <li><span className="text-gray-500 text-sm">Bizim haqqımızda</span></li>
              <li><span className="text-gray-500 text-sm">Əlaqə</span></li>
              <li><span className="text-gray-500 text-sm">Qaydalar</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 py-6">
          <p className="text-center text-sm text-gray-400">
            © 2026 Frila. Bütün hüquqlar qorunur.
          </p>
        </div>
      </footer>
    </main>
  );
}