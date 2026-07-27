'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'
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

const STEPS = ['pending', 'accepted', 'delivered', 'completed']

function Stars({ rating, size = 'w-5 h-5', onRate }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={onRate ? () => onRate(n) : undefined}
          className={onRate ? 'cursor-pointer' : 'cursor-default'}
        >
          <svg
            className={`${size} ${n <= rating ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.368-2.446a1 1 0 00-1.176 0l-3.368 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function SifarisDetail() {
  const [user, setUser] = useState(null)
  const [order, setOrder] = useState(null)
  const [buyer, setBuyer] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')

  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const messagesEndRef = useRef(null)

  const [existingReview, setExistingReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  useEffect(() => {
    if (!order) return
    loadMessages()
    const interval = setInterval(loadMessages, 4000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/giris')
      return
    }
    setUser(user)

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

    if (orderData.status === 'completed' && orderData.buyer_id === user.id) {
      const { data: reviewData } = await supabase
        .from('gig_reviews')
        .select('*')
        .eq('order_id', orderData.id)
        .maybeSingle()
      setExistingReview(reviewData)
    }

    setLoading(false)
  }

  const loadMessages = async () => {
    const { data } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', params.id)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const updateStatus = async (status) => {
    setActing(true)
    setError('')

    const tsField = {
      accepted: 'accepted_at',
      delivered: 'delivered_at',
      completed: 'completed_at',
      cancelled: 'cancelled_at',
    }[status]

    const update = { status }
    if (tsField) update[tsField] = new Date().toISOString()

    const { error: updateError } = await supabase.from('orders').update(update).eq('id', order.id)

    setActing(false)

    if (updateError) {
      setError('Xəta baş verdi: ' + updateError.message)
      return
    }

    const notifyUserId = isSeller ? order.buyer_id : order.seller_id
    const statusMessages = {
      accepted: 'Sifarişiniz qəbul olundu',
      delivered: 'Sifarişiniz təhvil verildi',
      completed: 'Sifariş tamamlandı',
      cancelled: 'Sifariş ləğv edildi',
    }
    await supabase.from('notifications').insert({
      user_id: notifyUserId,
      type: 'order_status',
      title: statusMessages[status] || 'Sifariş yeniləndi',
      message: `"${order.gig_title}" sifarişinin statusu dəyişdi`,
      link: '/sifaris/' + order.id,
    })

    if (status === 'completed') {
      setShowReviewForm(true)
    }

    loadOrder()
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setSubmittingReview(true)
    setError('')

    const { error: reviewError } = await supabase.from('gig_reviews').insert({
      gig_id: order.gig_id,
      user_id: user.id,
      order_id: order.id,
      rating: reviewRating,
      comment: reviewComment,
    })

    setSubmittingReview(false)

    if (reviewError) {
      setError('Rəy göndərilərkən xəta: ' + reviewError.message)
      return
    }

    setShowReviewForm(false)
    loadOrder()
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    setSending(true)
    const { error } = await supabase.from('order_messages').insert({
      order_id: order.id,
      sender_id: user.id,
      content: messageText.trim(),
    })

    if (!error) {
      const recipientId = isBuyer ? order.seller_id : order.buyer_id
      await supabase.from('notifications').insert({
        user_id: recipientId,
        type: 'new_message',
        title: 'Yeni mesaj',
        message: `"${order.gig_title}" sifarişi üzrə yeni mesaj aldınız`,
        link: '/sifaris/' + order.id,
      })
      setMessageText('')
      loadMessages()
    }
    setSending(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      setError('Fayl 20MB-dan kiçik olmalıdır')
      return
    }

    setUploadingFile(true)
    setError('')

    const filePath = `${order.id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage.from('order-files').upload(filePath, file)

    if (uploadError) {
      setUploadingFile(false)
      setError('Fayl yüklənərkən xəta: ' + uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from('order-files').getPublicUrl(filePath)

    await supabase.from('order_messages').insert({
      order_id: order.id,
      sender_id: user.id,
      file_url: urlData.publicUrl,
      file_name: file.name,
    })

    setUploadingFile(false)
    loadMessages()
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Yüklənir...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bu sifariş tapılmadı.</p>
          <a href="/xidmetler" className="text-purple-700 font-medium hover:underline">Xidmətlərə qayıt</a>
        </div>
      </main>
    )
  }

  const isBuyer = user?.id === order.buyer_id
  const isSeller = user?.id === order.seller_id
  const currentStepIndex = STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'
  const isImageFile = (name) => /\.(jpe?g|png|gif|webp)$/i.test(name || '')

  return (
    <main className="min-h-screen bg-white antialiased">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
                    <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px] overflow-x-auto whitespace-nowrap">

            <a href="/xidmetler" className="text-gray-500 hover:text-gray-900 transition-colors">Xidmətlər</a>
            <a href="/profilim" className="text-gray-500 hover:text-gray-900 transition-colors">Profilim</a>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-6">
        {/* Sol tərəf */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <a href="/xidmetler" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-700">
            ← Geri
          </a>

          <div className="rounded-3xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
              <div>
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight leading-snug">{order.gig_title}</h1>
                <p className="text-xs text-gray-500 mt-1">
                  #{order.id.slice(0, 8)} · {order.package_tier === 'basic' ? 'Basic' : order.package_tier === 'standard' ? 'Standard' : 'Premium'}
                </p>
              </div>
              <span className={`${STATUS_COLORS[order.status]} rounded-full px-3 py-1 text-xs font-medium flex-shrink-0`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            {!isCancelled && (
              <div className="flex items-center mb-6">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        i <= currentStepIndex ? 'bg-purple-700 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {i < currentStepIndex ? '✓' : i + 1}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIndex ? 'bg-purple-700' : 'bg-gray-100'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 mb-5 text-sm">
              <div className="flex items-center gap-2.5">
                {buyer?.avatar_url ? (
                  <img src={buyer.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-semibold">
                    {(buyer?.full_name || '?')[0]}
                  </div>
                )}
                <span className="text-gray-600">Sifarişçi: <strong className="text-gray-900">{buyer?.full_name}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                {seller?.avatar_url ? (
                  <img src={seller.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-semibold">
                    {(seller?.full_name || '?')[0]}
                  </div>
                )}
                <span className="text-gray-600">Freelancer: <strong className="text-gray-900">{seller?.full_name}</strong></span>
              </div>
            </div>

            <div className="text-sm text-gray-700 mb-5 pb-5 border-b border-gray-100">
              Qiymət: <strong className="text-purple-700">{order.price} AZN</strong>
            </div>

            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

            {!isCancelled && order.status !== 'completed' && (
              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && isSeller && (
                  <button disabled={acting} onClick={() => updateStatus('accepted')}
                    className="px-4 py-2 bg-purple-700 text-white rounded-full text-xs font-medium hover:bg-purple-800 transition disabled:opacity-50">
                    Sifarişi qəbul et
                  </button>
                )}
                {order.status === 'accepted' && isSeller && (
                  <button disabled={acting} onClick={() => updateStatus('delivered')}
                    className="px-4 py-2 bg-purple-700 text-white rounded-full text-xs font-medium hover:bg-purple-800 transition disabled:opacity-50">
                    Təhvil ver
                  </button>
                )}
                {order.status === 'delivered' && isBuyer && (
                  <>
                    <button disabled={acting} onClick={() => updateStatus('completed')}
                      className="px-4 py-2 bg-purple-700 text-white rounded-full text-xs font-medium hover:bg-purple-800 transition disabled:opacity-50">
                      Təhvil al
                    </button>
                    <button disabled={acting} onClick={() => updateStatus('accepted')}
                      className="px-4 py-2 border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-50 transition disabled:opacity-50">
                      Düzəliş tələb et
                    </button>
                  </>
                )}
                {(order.status === 'pending' || order.status === 'accepted') && (isBuyer || isSeller) && (
                  <button disabled={acting} onClick={() => updateStatus('cancelled')}
                    className="px-4 py-2 text-red-600 rounded-full text-xs font-medium hover:bg-red-50 transition disabled:opacity-50">
                    Ləğv et
                  </button>
                )}
              </div>
            )}

            {/* Rəy bölməsi (yalnız sifarişçi + tamamlanmış sifariş) */}
            {order.status === 'completed' && isBuyer && (
              <div className="pt-5 mt-5 border-t border-gray-100">
                {existingReview ? (
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-2">Sənin rəyin</p>
                    <Stars rating={existingReview.rating} size="w-4 h-4" />
                    {existingReview.comment && (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{existingReview.comment}</p>
                    )}
                  </div>
                ) : showReviewForm ? (
                  <form onSubmit={submitReview}>
                    <p className="text-sm font-medium text-gray-900 mb-2">Freelancerə rəy bildir</p>
                    <div className="mb-3">
                      <Stars rating={reviewRating} onRate={setReviewRating} />
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none mb-3"
                      placeholder="Təcrübən haqqında yaz (istəyə bağlı)"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full px-4 py-2.5 bg-purple-700 text-white rounded-xl text-sm font-medium hover:bg-purple-800 transition disabled:opacity-50"
                    >
                      {submittingReview ? 'Göndərilir...' : 'Rəyi göndər'}
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full px-4 py-2.5 border border-purple-200 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-50 transition"
                  >
                    ⭐ Rəy bildir
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sağ tərəf: Çat */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Danışıq</h2>
              <p className="text-xs text-gray-400 mt-0.5">Layihə haqqında məlumat mübadiləsi et, fayl göndər</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Hələ mesaj yoxdur. Layihə haqqında məlumat yazmaqla başla.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user.id
                  const sender = msg.sender_id === buyer?.id ? buyer : seller
                  return (
                    <div key={msg.id} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                      {sender?.avatar_url ? (
                        <img src={sender.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {(sender?.full_name || '?')[0]}
                        </div>
                      )}
                      <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                        {msg.content && (
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMine ? 'bg-purple-700 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                          }`}>
                            {msg.content}
                          </div>
                        )}
                        {msg.file_url && (
                          isImageFile(msg.file_name) ? (
                            <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                              <img src={msg.file_url} alt={msg.file_name} className="max-w-[220px] rounded-2xl mt-1 border border-gray-100" />
                            </a>
                          ) : (
                            <a
                              href={msg.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm border mt-1 ${
                                isMine ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              📎 {msg.file_name}
                            </a>
                          )
                        )}
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="border-t border-gray-100 p-4 flex items-center gap-2">
              <label className="flex-shrink-0 cursor-pointer p-2.5 rounded-full hover:bg-gray-100 transition">
                {uploadingFile ? (
                  <span className="text-xs text-gray-400">...</span>
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                )}
                <input type="file" onChange={handleFileUpload} disabled={uploadingFile} className="hidden" />
              </label>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Mesaj yaz..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="flex-shrink-0 w-10 h-10 bg-purple-700 text-white rounded-full flex items-center justify-center hover:bg-purple-800 transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}