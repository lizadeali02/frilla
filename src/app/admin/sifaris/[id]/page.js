'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'

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

export default function AdminOrderView() {
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [order, setOrder] = useState(null)
  const [buyer, setBuyer] = useState(null)
  const [seller, setSeller] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    checkAccess()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

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
    loadOrder()
  }

  const loadOrder = async () => {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!orderData) {
      setLoading(false)
      return
    }
    setOrder(orderData)

    const { data: buyerData } = await supabase.from('profiles').select('*').eq('id', orderData.buyer_id).single()
    setBuyer(buyerData)

    const { data: sellerData } = await supabase.from('profiles').select('*').eq('id', orderData.seller_id).single()
    setSeller(sellerData)

    const { data: messagesData } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', params.id)
      .order('created_at', { ascending: true })
    setMessages(messagesData || [])

    setLoading(false)
  }

  if (checking || loading) {
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

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bu sifariş tapılmadı.</p>
          <a href="/admin" className="text-purple-700 font-medium hover:underline">Admin panelə qayıt</a>
        </div>
      </main>
    )
  }

  const isImageFile = (name) => /\.(jpe?g|png|gif|webp)$/i.test(name || '')

  return (
    <main className="min-h-screen bg-white antialiased">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
                    <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px] overflow-x-auto whitespace-nowrap">

            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">ADMIN</span>
            <a href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">Admin Panel</a>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <a href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-700 mb-6">
          ← Admin panelə qayıt
        </a>

        <div className="rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{order.gig_title}</h1>
              <p className="text-sm text-gray-500 mt-1">Sifariş #{order.id.slice(0, 8)}</p>
            </div>
            <span className={`${STATUS_COLORS[order.status]} rounded-full px-3 py-1 text-sm font-medium`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Sifarişçi</p>
              <div className="flex items-center gap-3">
                {buyer?.avatar_url ? (
                  <img src={buyer.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-semibold">
                    {(buyer?.full_name || '?')[0]}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900">{buyer?.full_name}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Freelancer</p>
              <div className="flex items-center gap-3">
                {seller?.avatar_url ? (
                  <img src={seller.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-semibold">
                    {(seller?.full_name || '?')[0]}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900">{seller?.full_name}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            Qiymət: <strong className="text-purple-700">{order.price} AZN</strong>
          </div>
        </div>

        {/* Çat tarixçəsi (yalnız oxumaq üçün) */}
        <div className="rounded-3xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Danışıq tarixçəsi</h2>
            <p className="text-xs text-gray-400 mt-0.5">Yalnız baxış üçün — admin monitorinqi</p>
          </div>

          <div className="p-6 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Bu sifarişdə mesaj yoxdur</p>
            ) : (
              messages.map((msg) => {
                const sender = msg.sender_id === buyer?.id ? buyer : seller
                const senderLabel = msg.sender_id === buyer?.id ? 'Sifarişçi' : 'Freelancer'
                return (
                  <div key={msg.id} className="flex gap-3">
                    {sender?.avatar_url ? (
                      <img src={sender.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {(sender?.full_name || '?')[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{sender?.full_name}</span>
                        <span className="text-xs text-gray-400">({senderLabel})</span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.created_at).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {msg.content && (
                        <div className="bg-gray-50 rounded-2xl px-4 py-2.5 text-sm text-gray-800 inline-block">
                          {msg.content}
                        </div>
                      )}
                      {msg.file_url && (
                        isImageFile(msg.file_name) ? (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                            <img src={msg.file_url} alt={msg.file_name} className="max-w-[200px] rounded-2xl mt-1 border border-gray-100" />
                          </a>
                        ) : (
                          <a
                            href={msg.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 mt-1"
                          >
                            📎 {msg.file_name}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </main>
  )
}