'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const TABS = [
  { key: 'users', label: 'İstifadəçilər' },
  { key: 'gigs', label: 'Xidmətlər' },
  { key: 'orders', label: 'Sifarişlər' },
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

  const [users, setUsers] = useState([])
  const [gigs, setGigs] = useState([])
  const [orders, setOrders] = useState([])
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

    setLoadingData(false)
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