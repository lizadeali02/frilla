'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const TABS = [
  { key: 'users', label: 'İstifadəçilər' },
  { key: 'gigs', label: 'Xidmətlər' },
  { key: 'orders', label: 'Sifarişlər' },
  { key: 'disputes', label: 'Mübahisələr' },
]

const STATUS_LABELS = {
  pending: 'Gözləyir',
  accepted: 'İcra olunur',
  delivered: 'Təhvil verilib',
  completed: 'Tamamlanıb',
  cancelled: 'Ləğv edilib',
}

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  delivered: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export default function AdminPanel() {
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [users, setUsers] = useState([])
  const [gigs, setGigs] = useState([])
  const [orders, setOrders] = useState([])
  const [disputes, setDisputes] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/giris')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      setChecking(false)
      setIsAdmin(false)
      return
    }

    setIsAdmin(true)
    setChecking(false)
    loadAllData()
    loadNotifications(user.id)
  }

  const loadAllData = async () => {
    setLoadingData(true)

    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(usersData || [])

    const { data: gigsData } = await supabase
      .from('gigs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    setGigs(gigsData || [])

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(ordersData || [])

    const { data: disputesData } = await supabase
      .from('order_disputes')
      .select('*, orders(gig_title, price)')
      .order('created_at', { ascending: false })
    setDisputes(disputesData || [])

    setLoadingData(false)
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

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bu istifadəçinin profilini silmək istədiyinizə əminsiniz? (Qeyd: bu, giriş hesabını deyil, yalnız profil məlumatlarını siləcək)')) return
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (!error) loadAllData()
  }

  const handleDeleteGig = async (gigId) => {
    if (!confirm('Bu xidməti silmək istədiyinizə əminsiniz?')) return
    const { error } = await supabase.from('gigs').delete().eq('id', gigId)
    if (!error) loadAllData()
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Yüklənir...</p>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bu səhifəyə giriş icazəniz yoxdur.</p>
          <a href="/" className="text-purple-700 font-medium hover:underline">Ana səhifəyə qayıt</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50/50 antialiased">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
                    <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px] overflow-x-auto whitespace-nowrap">

            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">ADMIN</span>

            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                    {notifications.filter((n) => !n.read).length > 9 ? '9+' : notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="fixed top-16 right-4 left-4 sm:left-auto sm:right-6 sm:w-80 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 max-h-[70vh] overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm">Admin bildirişləri</h3>
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

            <a href="/xidmetler" className="text-gray-500 hover:text-gray-900 transition-colors">Xidmətlər</a>
            <a href="/profilim" className="text-gray-500 hover:text-gray-900 transition-colors">Profilim</a>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">Admin Panel</h1>

        <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-purple-700 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadingData ? (
          <p className="text-gray-400">Yüklənir...</p>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-5">Ümumi: {users.length} istifadəçi</p>
                 <div className="flex flex-col gap-3">
                  {users.map((u) => (
                    <div key={u.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                      <div
                        onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center text-sm font-semibold">
                              {(u.full_name || '?')[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{u.full_name}</p>
                            <p className="text-xs text-gray-500">
                              {u.role === 'freelancer' ? 'Freelancer' : 'Sifarişçi'} · Qoşulub: {formatDate(u.created_at)}
                              {u.is_admin && ' · Admin'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{expandedUserId === u.id ? 'Bağla ▲' : 'Detallar ▼'}</span>
                          {!u.is_admin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id) }}
                              className="text-sm text-red-500 hover:underline flex-shrink-0"
                            >
                              Sil
                            </button>
                          )}
                        </div>
                      </div>

                      {expandedUserId === u.id && u.role === 'freelancer' && (
                        <div className="px-4 pb-4 pt-1 grid sm:grid-cols-2 gap-4 bg-gray-50/50 border-t border-gray-100">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Telefon</p>
                            <p className="text-sm text-gray-800">{u.phone || 'Qeyd olunmayıb'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Təcrübə</p>
                            <p className="text-sm text-gray-800">{u.experience_years || 'Qeyd olunmayıb'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Sertifikatlar</p>
                            <p className="text-sm text-gray-800">{u.certificates || 'Qeyd olunmayıb'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bank rekvizitləri</p>
                            <p className="text-sm text-gray-800">{u.bank_requisites || 'Qeyd olunmayıb'}</p>
                          </div>
                          {u.creator_status === 'pending' && (
                            <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-amber-900">🏅 Creator müraciəti gözləyir</p>
                                <a href={u.creator_social_link} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-700 hover:underline break-all">
                                  {u.creator_social_link}
                                </a>
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  await supabase.from('profiles').update({ creator_status: 'approved', is_creator: true }).eq('id', u.id)
                                  loadAllData()
                                }}
                                className="px-3 py-1.5 bg-amber-600 text-white rounded-full text-xs font-medium hover:bg-amber-700 transition flex-shrink-0"
                              >
                                Təsdiqlə
                              </button>
                            </div>
                          )}
                          {u.creator_status === 'approved' && (
                            <div className="sm:col-span-2 text-xs text-green-700 font-medium">✓ Frila Creator</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gigs' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-5">Ümumi: {gigs.length} xidmət</p>
                <div className="flex flex-col gap-3">
                  {gigs.map((gig) => (
                    <div key={gig.id} className="flex items-center justify-between border border-gray-100 rounded-2xl p-4">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium mb-1.5">
                          {gig.category}
                        </span>
                        <h4 className="font-medium text-gray-900">{gig.title}</h4>
                        <p className="text-sm text-gray-500">
                          {gig.profiles?.full_name} · {gig.price} AZN
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a href={'/gig/' + gig.id} className="text-sm text-purple-700 hover:underline">Bax</a>
                        <button
                          onClick={() => handleDeleteGig(gig.id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm text-gray-500 mb-5">Ümumi: {orders.length} sifariş</p>
                <div className="flex flex-col gap-3">
                  {orders.map((order) => (
                    <a
                      key={order.id}
                      href={'/admin/sifaris/' + order.id}
                      className="flex items-center justify-between border border-gray-100 rounded-2xl p-4 hover:shadow-md transition"
                    >
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-1.5 ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <h4 className="font-medium text-gray-900">{order.gig_title}</h4>
                        <p className="text-sm text-gray-500">{order.price} AZN · {formatDate(order.created_at)}</p>
                      </div>
                      <span className="text-purple-700 text-sm font-medium">Baxış (çat daxil) →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}