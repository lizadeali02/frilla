'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useLanguage } from '../context/LanguageContext'
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
  const { lang, changeLang, t } = useLanguage()
  const [showLangMenu, setShowLangMenu] = useState(false)

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
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowLangMenu((prev) => !prev)}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 transition text-sm font-medium text-gray-600"
              >
                {lang === 'az' ? '🇦🇿 AZ' : lang === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                  <div className="fixed top-16 left-4 sm:left-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 w-28">
                    {[
                      { code: 'az', label: '🇦🇿 AZ' },
                      { code: 'en', label: '🇬🇧 EN' },
                      { code: 'ru', label: '🇷🇺 RU' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { changeLang(l.code); setShowLangMenu(false) }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition ${lang === l.code ? 'font-semibold text-purple-700' : 'text-gray-600'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <a href="/xidmetler" className="text-gray-500 hover:text-gray-900 transition-colors">
              {t('nav_services')}
            </a>

            

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
                
                
                

                <a href="/profilim" className="text-gray-500 hover:text-gray-900 transition-colors">
                  {t('nav_profile')}
                </a>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-1.5 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <>
                <>
  <a
    href="/giris"
    className="text-gray-500 hover:text-gray-900 transition-colors"
  >
    {t('nav_login')}
  </a>

  <a
    href="/qeydiyyat"
    className="px-4 py-1.5 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-colors"
  >
    {t('nav_signup')}
  </a>
</>
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
              {t('hero_badge')}
            </span>
            <h1
              className="animate-fade-up text-4xl md:text-6xl font-semibold text-gray-900 tracking-tight leading-[1.1] mb-6"
              style={{ animationDelay: '0.1s' }}
            >
              {t('hero_title_1')}<br />
              <span className="gradient-text">{t('hero_title_2')}</span><br />
              {t('hero_title_3')}
            </h1>
            <p
              className="animate-fade-up text-lg text-gray-500 mb-8 leading-relaxed max-w-lg"
              style={{ animationDelay: '0.2s' }}
            >
              {t('hero_subtitle')}
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
                  placeholder={t('hero_search_placeholder')}
                  className="flex-1 px-3 py-2 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 min-w-0"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 text-white rounded-full font-medium hover:bg-purple-800 transition-colors flex-shrink-0"
                >
                  {t('hero_search_btn')}
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
                {t('hero_cta_search')}
              </a>
              <a
                href="/qeydiyyat"
                className="px-7 py-3 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-all hover:scale-[1.03] border border-gray-200"
              >
                {t('hero_cta_freelancer')}
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
            {t('why_title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{t('why_safe_title')}</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                {t('why_safe_desc')}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{t('why_fast_title')}</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                {t('why_fast_desc')}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{t('why_quality_title')}</h3>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                {t('why_quality_desc')}
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
              <li><a href="/haqqimizda" className="text-gray-500 text-sm hover:text-purple-700 transition-colors">Bizim haqqımızda</a></li>
              <li><a href="/elaqe" className="text-gray-500 text-sm hover:text-purple-700 transition-colors">Əlaqə</a></li>
              <li><a href="/qaydalar" className="text-gray-500 text-sm hover:text-purple-700 transition-colors">Qaydalar</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-6xl mx-auto px-6">
          <p className="text-sm text-gray-400">
            © 2026 Frila. Bütün hüquqlar qorunur.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6 6 0 100 12 6 6 0 000-12zm0 9.837a3.837 3.837 0 110-7.674 3.837 3.837 0 010 7.674zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@frila.aze" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}