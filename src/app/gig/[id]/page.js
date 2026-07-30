'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'

function Stars({ rating, size = 'w-4 h-4' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${size} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.368-2.446a1 1 0 00-1.176 0l-3.368 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
        </svg>
      ))}
    </div>
  )
}

export default function GigDetail() {
  const [gig, setGig] = useState(null)
  const [packages, setPackages] = useState([])
  const [images, setImages] = useState([])
  const [freelancer, setFreelancer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [activeTier, setActiveTier] = useState('basic')
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const params = useParams()
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    const { data: gigData } = await supabase
      .from('gigs')
      .select('*, profiles(id, full_name, avatar_url, created_at, availability)')
      .eq('id', params.id)
      .single()

    if (!gigData) {
      setLoading(false)
      return
    }

    setGig(gigData)
    setFreelancer(gigData.profiles)

    const { data: packagesData } = await supabase
      .from('gig_packages')
      .select('*')
      .eq('gig_id', params.id)
      .order('price', { ascending: true })
    setPackages(packagesData || [])
    if (packagesData && packagesData.length > 0) {
      setActiveTier(packagesData[0].tier)
    }

    const { data: imagesData } = await supabase
      .from('gig_images')
      .select('*')
      .eq('gig_id', params.id)
      .order('sort_order', { ascending: true })
    setImages(imagesData || [])

    const { data: reviewsData } = await supabase
      .from('gig_reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('gig_id', params.id)
      .order('created_at', { ascending: false })
    setReviews(reviewsData || [])

    const { count } = await supabase
      .from('gig_likes')
      .select('*', { count: 'exact', head: true })
      .eq('gig_id', params.id)
    setLikeCount(count || 0)

    if (user) {
      const { data: likeData } = await supabase
        .from('gig_likes')
        .select('id')
        .eq('gig_id', params.id)
        .eq('user_id', user.id)
        .maybeSingle()
      setLiked(Boolean(likeData))
    }

    setLoading(false)
  }
const handleOrder = async () => {
    if (!user) {
      router.push('/giris')
      return
    }
    setOrdering(true)
    setOrderError('')

    const { data, error } = await supabase
      .from('orders')
      .insert({
        gig_id: gig.id,
        gig_title: gig.title,
        package_tier: activePackage.tier,
        buyer_id: user.id,
        seller_id: freelancer.id,
        price: activePackage.price,
      })
      .select()
      .single()

    setOrdering(false)

   if (error) {
      setOrderError('Xəta baş verdi: ' + error.message)
      return
    }

    const packageLabel = activePackage.tier === 'basic' ? 'Basic' : activePackage.tier === 'standard' ? 'Standard' : 'Premium'
    await supabase.from('order_messages').insert({
      order_id: data.id,
      sender_id: user.id,
      content: `📋 Yeni sifariş\n\nXidmət: ${gig.title}\nPaket: ${packageLabel}\nQiymət: ${activePackage.price} AZN\nÇatdırılma: ${activePackage.delivery_days} gün\n\nSalam! Bu sifarişi verdim, zəhmət olmasa layihə haqqında ətraflı məlumat üçün mənimlə əlaqə saxlayın.`,
    })

    router.push('/sifaris/' + data.id)

    await supabase.from('notifications').insert({
      user_id: freelancer.id,
      type: 'new_order',
      title: 'Yeni sifariş!',
      message: `"${gig.title}" xidməti üçün yeni sifariş aldınız`,
      link: '/sifaris/' + data.id,
    })

    router.push('/sifaris/' + data.id)
  }
  const toggleLike = async () => {
    if (!user) {
      router.push('/giris')
      return
    }

    if (liked) {
      await supabase.from('gig_likes').delete().eq('gig_id', params.id).eq('user_id', user.id)
      setLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await supabase.from('gig_likes').insert({ gig_id: params.id, user_id: user.id })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/giris')
      return
    }
    setSubmittingReview(true)

    const { error } = await supabase.from('gig_reviews').insert({
      gig_id: params.id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewComment,
    })

    setSubmittingReview(false)

    if (!error) {
      setShowReviewForm(false)
      setReviewComment('')
      setReviewRating(5)
      loadData()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Yüklənir...</p>
      </main>
    )
  }

  if (!gig) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bu xidmət tapılmadı.</p>
          <a href="/xidmetler" className="text-purple-700 font-medium hover:underline">Xidmətlərə qayıt</a>
        </div>
      </main>
    )
  }

  const activePackage = packages.find((p) => p.tier === activeTier) || packages[0]
  const fInitials = (freelancer?.full_name || '?')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const tierLabels = { basic: 'Basic', standard: 'Standard', premium: 'Premium' }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const userAlreadyReviewed = user && reviews.some((r) => r.user_id === user.id)

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

      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium mb-3">
              {gig.category}
            </span>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight leading-snug">
                {gig.title}
              </h1>
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium flex-shrink-0 transition-colors ${
                  liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likeCount}
              </button>
            </div>

            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Stars rating={avgRating} />
                <span className="text-sm font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({reviews.length})</span>
              </div>
            )}
          </div>

          {/* Şəkil qalereyası */}
          {images.length > 0 && (
            <div>
              <div className="rounded-3xl overflow-hidden bg-gray-100 aspect-video">
                <img src={images[activeImage].image_url} alt={gig.title} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                        activeImage === i ? 'border-purple-600' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Freelancer kartı */}
          {freelancer && (
            <a href={"/freelancer/" + freelancer.id} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-5 hover:bg-gray-100 transition-colors">
              {freelancer.avatar_url ? (
                <img src={freelancer.avatar_url} alt={freelancer.full_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-purple-700 text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
                  {fInitials}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{freelancer.full_name}</p>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  ⭐ Yeni satıcı
                  {freelancer.availability && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        freelancer.availability === 'active' ? 'bg-green-500' :
                        freelancer.availability === 'busy' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      {freelancer.availability === 'active' ? 'Aktiv' :
                       freelancer.availability === 'busy' ? 'Məşğul' : 'Məzuniyyətdə'}
                    </>
                  )}
                </p>
              </div>
            </a>
          )}

          <div className="border-t border-gray-100 pt-6">
            <h2 className="font-semibold text-gray-900 mb-3">Xidmət haqqında</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{gig.description}</p>
          </div>

          {/* Rəylər */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">
                Rəylər {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {user && !userAlreadyReviewed && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="text-sm text-purple-700 font-medium hover:underline"
                >
                  Rəy yaz
                </button>
              )}
            </div>

            {showReviewForm && (
              <form onSubmit={submitReview} className="bg-gray-50 rounded-2xl p-5 mb-5">
                <label className="text-sm text-gray-600 font-medium block mb-2">Reytinq</label>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className="p-0.5"
                    >
                      <svg
                        className={`w-7 h-7 ${n <= reviewRating ? 'text-amber-400' : 'text-gray-200'}`}
                        fill="currentColor" viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.368-2.446a1 1 0 00-1.176 0l-3.368 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none text-sm"
                  placeholder="Təcrübən haqqında yaz (istəyə bağlı)"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-purple-700 text-white rounded-xl text-sm font-medium hover:bg-purple-800 transition disabled:opacity-50"
                  >
                    {submittingReview ? 'Göndərilir...' : 'Rəyi göndər'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-5 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    Ləğv et
                  </button>
                </div>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">Hələ heç bir rəy yazılmayıb</p>
            ) : (
              <div className="flex flex-col gap-5">
                {reviews.map((review) => {
                  const rInitials = (review.profiles?.full_name || '?')
                    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={review.id} className="flex gap-3">
                      {review.profiles?.avatar_url ? (
                        <img src={review.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {rInitials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{review.profiles?.full_name}</p>
                          <Stars rating={review.rating} size="w-3.5 h-3.5" />
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sağ tərəf: Paket seçimi */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
            {packages.length > 1 && (
              <div className="grid gap-1 bg-gray-100 rounded-xl p-1 mb-6" style={{ gridTemplateColumns: `repeat(${packages.length}, 1fr)` }}>
                {packages.map((pkg) => (
                  <button
                    key={pkg.tier}
                    onClick={() => setActiveTier(pkg.tier)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTier === pkg.tier ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {tierLabels[pkg.tier]}
                  </button>
                ))}
              </div>
            )}

            {activePackage && (
              <>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{tierLabels[activePackage.tier]} paket</h3>
                  <span className="text-2xl font-semibold text-purple-700">{activePackage.price} AZN</span>
                </div>

                <p className="text-gray-600 text-sm mb-5 leading-relaxed">{activePackage.description}</p>

                <div className="flex items-center gap-4 mb-5 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {activePackage.delivery_days} gün çatdırılma
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {activePackage.revision_count} düzəliş
                  </div>
                </div>

                {activePackage.features && (
                  <div className="flex flex-col gap-2 mb-6 pb-6 border-b border-gray-100">
                    {activePackage.features.split(',').map((f, i) => f.trim() && (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-purple-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f.trim()}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleOrder}
                  disabled={ordering || (freelancer && user?.id === freelancer.id)}
                  className="w-full bg-purple-700 text-white py-3 rounded-xl font-medium hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ordering ? 'Göndərilir...' : freelancer && user?.id === freelancer.id ? 'Öz xidmətindir' : 'Sifariş et'}
                </button>
                {orderError && <p className="text-red-500 text-xs text-center mt-2">{orderError}</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}