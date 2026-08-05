'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'gigs', label: 'Xidmətlərim' },
  { key: 'orders', label: 'Sifarişlər' },
  { key: 'earnings', label: 'Qazanc' },
  { key: 'partner', label: ' Partner' },
]

const KATEQORIYALAR = [
  'Qrafik dizayn',
  'Proqramlaşdırma',
  'Video montaj',
  'Digital marketinq',
  'Yazı və tərcümə',
  'Musiqi və səs',
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export default function Profilim() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [images, setImages] = useState([])
  const [myGigs, setMyGigs] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [stats, setStats] = useState({ completedOrders: 0, totalEarnings: 0, avgRating: 0, reviewCount: 0 })
  const [updatingAvailability, setUpdatingAvailability] = useState(false)
  const [creatorSocialLink, setCreatorSocialLink] = useState('')
  const [applyingCreator, setApplyingCreator] = useState(false)
  const [showFrilaLinkTip, setShowFrilaLinkTip] = useState(true)
  const [faqs, setFaqs] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [addingFaq, setAddingFaq] = useState(false)
  const [myBuyerOrders, setMyBuyerOrders] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [showBecomeFreelancer, setShowBecomeFreelancer] = useState(false)
  const [skills, setSkills] = useState('')
  const [about, setAbout] = useState('')
  const [education, setEducation] = useState('')
  const [becoming, setBecoming] = useState(false)

  const [editingAbout, setEditingAbout] = useState(false)
  const [editSkills, setEditSkills] = useState('')
  const [editAbout, setEditAbout] = useState('')
  const [editEducation, setEditEducation] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editExperience, setEditExperience] = useState('')
  const [editCertificates, setEditCertificates] = useState('')
  const [editRequisites, setEditRequisites] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])



  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/giris')
      return
    }

    setUser(user)
    loadNotifications(user.id)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profileData)
    const { data: buyerOrdersData } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
    setMyBuyerOrders(buyerOrdersData || [])
    setEditSkills(profileData?.skills || '')
    setEditAbout(profileData?.about || '')
    setEditEducation(profileData?.education || '')
    setEditPhone(profileData?.phone || '')
    setEditExperience(profileData?.experience_years || '')
    setEditCertificates(profileData?.certificates || '')
    setEditRequisites(profileData?.bank_requisites || '')

    if (profileData?.role === 'freelancer') {
      const { data: imagesData } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setImages(imagesData || [])

      const { data: gigsData } = await supabase
        .from('gigs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setMyGigs(gigsData || [])
      const { data: faqsData } = await supabase
        .from('freelancer_faqs')
        .select('*')
        .eq('freelancer_id', user.id)
        .order('sort_order', { ascending: true })
      setFaqs(faqsData || [])

      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      setMyOrders(ordersData || [])

      const completedOrders = (ordersData || []).filter((o) => o.status === 'completed')
      const totalEarnings = completedOrders.reduce((sum, o) => sum + Number(o.price), 0)

      const gigIdList = (gigsData || []).map((g) => g.id)
      let avgRating = 0
      let reviewCount = 0
      if (gigIdList.length > 0) {
        const { data: allReviews } = await supabase
          .from('gig_reviews')
          .select('rating')
          .in('gig_id', gigIdList)
        if (allReviews && allReviews.length > 0) {
          reviewCount = allReviews.length
          avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        }
      }

      setStats({
        completedOrders: completedOrders.length,
        totalEarnings,
        avgRating,
        reviewCount,
      })
    }
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

  const handleAvailabilityChange = async (value) => {
    setUpdatingAvailability(true)
    await supabase.from('profiles').update({ availability: value }).eq('id', user.id)
    setProfile((prev) => ({ ...prev, availability: value }))
    setUpdatingAvailability(false)
  }

  const handleCreatorApply = async (e) => {
    e.preventDefault()
    if (!creatorSocialLink.trim()) return
    setApplyingCreator(true)
    await supabase.from('profiles').update({
      creator_status: 'pending',
      creator_social_link: creatorSocialLink.trim(),
    }).eq('id', user.id)
    setProfile((prev) => ({ ...prev, creator_status: 'pending', creator_social_link: creatorSocialLink.trim() }))

    const { data: admins } = await supabase.from('profiles').select('id').eq('is_admin', true)
    if (admins) {
      const notifRows = admins.map((a) => ({
        user_id: a.id,
        type: 'creator_application',
        title: 'Yeni Partner müraciəti',
        message: `${profile?.full_name} Frila Creator olmaq üçün müraciət etdi`,
        link: '/admin',
      }))
      await supabase.from('notifications').insert(notifRows)
    }

    setApplyingCreator(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingAvatar(true)
    setError('')

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setUploadingAvatar(false)
      setError('Şəkil yüklənərkən xəta: ' + uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const avatarUrl = urlData.publicUrl + '?t=' + Date.now()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)

    setUploadingAvatar(false)

    if (updateError) {
      setError('Profil yenilənərkən xəta: ' + updateError.message)
      return
    }

    loadData()
  }

  const handleBecomeFreelancer = async (e) => {
    e.preventDefault()
    setBecoming(true)
    setError('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'freelancer', skills, about, education })
      .eq('id', user.id)

    if (updateError) {
      setBecoming(false)
      setError('Xəta baş verdi: ' + updateError.message)
      return
    }

    setBecoming(false)
    setShowBecomeFreelancer(false)
    loadData()
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        skills: editSkills,
        about: editAbout,
        education: editEducation,
        phone: editPhone,
        experience_years: editExperience,
        certificates: editCertificates,
        bank_requisites: editRequisites,
      })
      .eq('id', user.id)

    setSavingProfile(false)
    if (!updateError) {
      setEditingAbout(false)
      loadData()
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file)

    if (uploadError) {
      setUploading(false)
      setError('Şəkil yüklənərkən xəta: ' + uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(filePath)

    const { error: insertError } = await supabase
      .from('portfolio_images')
      .insert({ user_id: user.id, image_url: urlData.publicUrl })

    if (insertError) {
      setUploading(false)
      setError('Şəkil qeydə alınarkən xəta: ' + insertError.message)
      return
    }

    setUploading(false)
    loadData()
  }

  const handleDeleteImage = async (imageId) => {
    const { error } = await supabase.from('portfolio_images').delete().eq('id', imageId)
    if (!error) loadData()
  }
const handleAddFaq = async (e) => {
    e.preventDefault()
    if (!newQuestion.trim() || !newAnswer.trim()) return
    setAddingFaq(true)
    await supabase.from('freelancer_faqs').insert({
      freelancer_id: user.id,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      sort_order: faqs.length,
    })
    setNewQuestion('')
    setNewAnswer('')
    setAddingFaq(false)
    loadData()
  }

  const handleDeleteFaq = async (faqId) => {
    await supabase.from('freelancer_faqs').delete().eq('id', faqId)
    loadData()
  }


  const handleDeleteGig = async (gigId) => {
    if (!confirm('Bu xidməti silmək istədiyinizə əminsiniz?')) return
    const { error } = await supabase.from('gigs').delete().eq('id', gigId)
    if (!error) loadData()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Yüklənir...</p>
      </main>
    )
  }

  const initials = (profile?.full_name || user?.email || '?')
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const joinedDate = formatDate(profile?.created_at)

  const checklist = [
    { label: 'Profilini tamamla (Bacarıq + Haqqımda)', done: Boolean(profile?.skills && profile?.about) },
    { label: 'Ən azı 1 portfolio şəkli əlavə et', done: images.length > 0 },
    { label: 'Ən azı 1 xidmət (gig) əlavə et', done: myGigs.length > 0 },
    { label: 'Ən azı 3 xidmət əlavə et', done: myGigs.length >= 3 },
  ]
  const completedCount = checklist.filter((c) => c.done).length

  return (
    <main className="min-h-screen bg-white antialiased flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
                    <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px] overflow-x-auto whitespace-nowrap">

            <a href="/xidmetler" className="text-gray-500 hover:text-gray-900 transition-colors">Xidmətlər</a>
            {profile?.role === 'freelancer' && (
              <a href="/xidmet-elave-et" className="text-gray-500 hover:text-gray-900 transition-colors">Xidmət əlavə et</a>
            )}
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
            

            <a href="/profilim" className="text-gray-900 font-medium">Profilim</a>
            <button onClick={handleSignOut} className="px-4 py-1.5 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
              Çıxış
            </button>

          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <a href="/sevimliler" className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:shadow-md transition">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Sevimlilər</span>
          </a>
          <a href="/mesajlarim" className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:shadow-md transition">
            <svg className="w-4 h-4 text-purple-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Mesajlarım</span>
          </a>
          <a href="/izlediklerim" className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:shadow-md transition">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 100-8 4 4 0 000 8zm6-1a4 4 0 10-2-7.46" />
            </svg>
            <span className="text-sm font-medium text-gray-700">İzlədiklərim</span>
          </a>
          {profile?.role === 'freelancer' && (
            <a href="/xidmet-elave-et" className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:shadow-md transition">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Xidmət əlavə et</span>
            </a>
          )}
        </div>
        {/* Profil başlığı */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="flex flex-wrap items-center gap-5 justify-between">
            <div className="flex items-center gap-5">
              <div className="relative group flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profil şəkli"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-purple-700 text-white flex items-center justify-center text-xl font-semibold">
                    {initials}
                  </div>
                )}
                <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} className="hidden" />
                </label>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{profile?.full_name}</h1>
                  {profile?.role === 'freelancer' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                      ⭐ Yeni Satıcı
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-0.5">
                  {user?.email} · Frila-ya qoşulub: {joinedDate}
                </p>
                {profile?.role === 'freelancer' && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 font-medium">Uyğunluq:</span>
                    <div className="flex gap-1.5">
                      {[
                        { key: 'active', label: 'Aktiv', color: 'bg-green-500' },
                        { key: 'busy', label: 'Məşğul', color: 'bg-amber-500' },
                        { key: 'vacation', label: 'Məzuniyyətdə', color: 'bg-red-500' },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={updatingAvailability}
                          onClick={() => handleAvailabilityChange(opt.key)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                            profile?.availability === opt.key
                              ? 'border-gray-300 bg-gray-50 text-gray-900'
                              : 'border-transparent text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {uploadingAvatar && <p className="text-xs text-gray-400 mt-3">Şəkil yüklənir...</p>}
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {/* Mənim sifarişlərim (sifarişçi kimi verdiyim) */}
        {myBuyerOrders.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
            <h3 className="font-semibold text-gray-900 mb-5">Mənim sifarişlərim</h3>
            <div className="flex flex-col gap-3">
              {myBuyerOrders.map((order) => (
                <a
                  key={order.id}
                  href={'/sifaris/' + order.id}
                  className="flex justify-between items-center border border-gray-100 rounded-2xl p-4 hover:shadow-md transition"
                >
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-1.5 ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'pending' ? 'Gözləyir' :
                       order.status === 'accepted' ? 'İcra olunur' :
                       order.status === 'delivered' ? 'Təhvil verilib' :
                       order.status === 'completed' ? 'Tamamlanıb' : 'Ləğv edilib'}
                    </span>
                    <h4 className="font-medium text-gray-900">{order.gig_title}</h4>
                    <p className="text-sm text-gray-500">{order.price} AZN</p>
                  </div>
                  <span className="text-purple-700 text-sm font-medium">Bax →</span>
                </a>
              ))}
            </div>
          </div>
        )}

         

        {/* Sifarişçi üçün: Freelancer olmaq seçimi */}
        {profile?.role === 'customer' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
            {!showBecomeFreelancer ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">Freelancer olmaq istəyirsən?</h3>
                <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                  Eyni hesabla həm sifariş ver, həm də xidmət təklif et
                </p>
                <button
                  onClick={() => setShowBecomeFreelancer(true)}
                  className="px-6 py-2.5 bg-purple-700 text-white rounded-full font-medium hover:bg-purple-800 transition-all hover:scale-[1.02]"
                >
                  Freelancer olmaq istəyirəm
                </button>
              </div>
            ) : (
              <form onSubmit={handleBecomeFreelancer} className="flex flex-col gap-4">
                <h3 className="font-semibold text-gray-900">Freelancer profilini tamamla</h3>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Bacarıqlarım</label>
                  <input type="text" required value={skills} onChange={(e) => setSkills(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Məs: Qrafik dizayn, Video montaj, Proqramlaşdırma" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Haqqımda</label>
                  <textarea required value={about} onChange={(e) => setAbout(e.target.value)} rows={3}
                    className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                    placeholder="Özün və təcrübən haqqında qısa məlumat" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Təhsil (istəyə bağlı)</label>
                  <input type="text" value={education} onChange={(e) => setEducation(e.target.value)}
                    className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Məs: Bakı Dövlət Universiteti, İnformatika" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-3 mt-1">
                  <button type="submit" disabled={becoming}
                    className="flex-1 bg-purple-700 text-white py-2.5 rounded-xl font-medium hover:bg-purple-800 transition-all disabled:opacity-50">
                    {becoming ? 'Gözləyin...' : 'Təsdiqlə'}
                  </button>
                  <button type="button" onClick={() => setShowBecomeFreelancer(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                    Ləğv et
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Freelancer Dashboard */}
        {profile?.role === 'freelancer' && (
          <>
           <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 w-full sm:w-fit overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-purple-700 text-white'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-2xl font-semibold text-gray-900">{myGigs.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Aktiv xidmət</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-2xl font-semibold text-gray-900">{stats.completedOrders}</p>
                    <p className="text-xs text-gray-500 mt-1">Tamamlanan sifariş</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalEarnings.toFixed(0)} AZN</p>
                    <p className="text-xs text-gray-500 mt-1">Ümumi qazanc</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.reviewCount > 0 ? stats.avgRating.toFixed(1) : '—'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.reviewCount > 0 ? `Orta reytinq (${stats.reviewCount})` : 'Orta reytinq'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Satıcı səviyyən: Yeni Satıcı</h3>
                    <span className="text-xs text-gray-400">{completedCount}/{checklist.length} tamamlandı</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-5">
                    Aşağıdakı addımları tamamlayaraq növbəti səviyyəyə (Səviyyə 1) yüksəl
                  </p>
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                    <div
                      className="h-full bg-purple-700 rounded-full transition-all"
                      style={{ width: (completedCount / checklist.length) * 100 + '%' }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    {checklist.map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.done ? 'bg-purple-700' : 'bg-gray-100'
                        }`}>
                          {item.done && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-semibold text-gray-900">Profil məlumatları</h3>
                    {!editingAbout && (
                      <button
                        onClick={() => setEditingAbout(true)}
                        className="text-sm text-purple-700 font-medium hover:underline"
                      >
                        Redaktə et
                      </button>
                    )}
                  </div>

                  

                  {!editingAbout ? (
                    <div className="flex flex-col gap-5">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Bacarıqlarım</h4>
                        <p className="text-gray-800 text-[15px]">{profile?.skills || '—'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Haqqımda</h4>
                        <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line">{profile?.about || '—'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Təhsil</h4>
                        <p className="text-gray-800 text-[15px]">{profile?.education || 'Qeyd olunmayıb'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Telefon</h4>
                        <p className="text-gray-800 text-[15px]">{profile?.phone || 'Qeyd olunmayıb'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Təcrübə</h4>
                        <p className="text-gray-800 text-[15px]">{profile?.experience_years || 'Qeyd olunmayıb'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Sertifikatlar</h4>
                        <p className="text-gray-800 text-[15px]">{profile?.certificates || 'Qeyd olunmayıb'}</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                      <div>
                        <label className="text-sm text-gray-600 font-medium">Bacarıqlarım</label>
                        <input type="text" value={editSkills} onChange={(e) => setEditSkills(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 font-medium">Haqqımda</label>
                        <textarea value={editAbout} onChange={(e) => setEditAbout(e.target.value)} rows={5}
                          className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                          placeholder="Təcrübən, işlədiyin sahələr, nə üçün səni seçməlidirlər..." />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 font-medium">Təhsil</label>
                        <input type="text" value={editEducation} onChange={(e) => setEditEducation(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="Məs: Bakı Dövlət Universiteti, İnformatika (2020-2024)" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 font-medium">Telefon nömrəsi (istəyə bağlı)</label>
                        <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="+994 XX XXX XX XX" />
                      </div>

                      <div>
                        <label className="text-sm text-gray-600 font-medium">Təcrübə (il)</label>
                        <input type="text" value={editExperience} onChange={(e) => setEditExperience(e.target.value)}
                          className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                          placeholder="Məs: 3 il" />
                      </div>

                      <div>
                        <label className="text-sm text-gray-600 font-medium">Sertifikatlar (istəyə bağlı)</label>
                        <textarea value={editCertificates} onChange={(e) => setEditCertificates(e.target.value)} rows={2}
                          className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                          placeholder="Sertifikatlarının siyahısı" />
                      </div>

                      
                      <div className="flex gap-3 mt-1">
                        <button type="submit" disabled={savingProfile}
                          className="px-5 py-2.5 bg-purple-700 text-white rounded-xl font-medium hover:bg-purple-800 transition-all disabled:opacity-50">
                          {savingProfile ? 'Gözləyin...' : 'Yadda saxla'}
                        </button>
                        <button type="button" onClick={() => setEditingAbout(false)}
                          className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                          Ləğv et
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-gray-900">Portfolio</h3>
                    <label>
                      <span className="inline-block px-4 py-2 bg-purple-700 text-white rounded-full text-sm font-medium cursor-pointer hover:bg-purple-800 transition-colors">
                        {uploading ? 'Yüklənir...' : '+ Şəkil əlavə et'}
                      </span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                    </label>
                  </div>
                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                  {images.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl py-12 text-center">
                      <p className="text-gray-400 text-sm">Hələ heç bir şəkil əlavə etməmisiniz</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((img) => (
                        <div key={img.id} className="relative group rounded-2xl overflow-hidden">
                          <img src={img.image_url} alt="Portfolio" className="w-full h-32 object-cover" />
                          <button onClick={() => handleDeleteImage(img.id)}
                            className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <h3 className="font-semibold text-gray-900 mb-5">Tez-tez verilən suallar</h3>

                  <form onSubmit={handleAddFaq} className="flex flex-col gap-3 mb-6 pb-6 border-b border-gray-100">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Sual (məs: Neçə düzəliş edirsiniz?)"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                    />
                    <textarea
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="Cavab"
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm resize-none"
                    />
                    <button
                      type="submit"
                      disabled={addingFaq}
                      className="self-start px-4 py-2 bg-purple-700 text-white rounded-full text-sm font-medium hover:bg-purple-800 transition disabled:opacity-50"
                    >
                      {addingFaq ? 'Əlavə edilir...' : '+ Sual əlavə et'}
                    </button>
                  </form>

                  {faqs.length === 0 ? (
                    <p className="text-gray-400 text-sm">Hələ heç bir sual əlavə etməmisiniz</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {faqs.map((faq) => (
                        <div key={faq.id} className="border border-gray-100 rounded-2xl p-4">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <p className="font-medium text-gray-900 text-sm mb-1">{faq.question}</p>
                              <p className="text-gray-500 text-sm">{faq.answer}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="text-xs text-red-500 hover:underline flex-shrink-0"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'gigs' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900">Xidmətlərim</h3>
                  <a href="/xidmet-elave-et" className="px-4 py-2 bg-purple-700 text-white rounded-full text-sm font-medium hover:bg-purple-800 transition-colors">
                    + Yeni xidmət
                  </a>
                </div>
                {myGigs.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl py-12 text-center">
                    <p className="text-gray-400 text-sm">Hələ heç bir xidmət əlavə etməmisiniz</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myGigs.map((gig) => (
                      <div key={gig.id} className="flex justify-between items-center border border-gray-100 rounded-2xl p-4">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium mb-1.5">
                            {gig.category}
                          </span>
                          <h4 className="font-medium text-gray-900">{gig.title}</h4>
                          <p className="text-sm text-gray-500">{gig.price} AZN</p>
                        </div>
                        <button onClick={() => handleDeleteGig(gig.id)}
                          className="text-sm text-red-500 hover:underline flex-shrink-0">
                          Sil
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h3 className="font-semibold text-gray-900 mb-6">Gələn sifarişlər</h3>
                {myOrders.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl py-16 text-center">
                    <p className="text-gray-400 text-sm">Hələ heç bir sifariş yoxdur</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myOrders.map((order) => (
                      <a
                        key={order.id}
                        href={'/sifaris/' + order.id}
                        className="flex justify-between items-center border border-gray-100 rounded-2xl p-4 hover:shadow-md transition"
                      >
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-1.5 ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.status === 'pending' ? 'Gözləyir' :
                             order.status === 'accepted' ? 'İcra olunur' :
                             order.status === 'delivered' ? 'Təhvil verilib' :
                             order.status === 'completed' ? 'Tamamlanıb' : 'Ləğv edilib'}
                          </span>
                          <h4 className="font-medium text-gray-900">{order.gig_title}</h4>
                          <p className="text-sm text-gray-500">{order.price} AZN</p>
                        </div>
                        <span className="text-purple-700 text-sm font-medium">Bax →</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            

            {activeTab === 'earnings' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h3 className="font-semibold text-gray-900 mb-6">Qazanc</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalEarnings.toFixed(0)} AZN</p>
                    <p className="text-xs text-gray-500 mt-1">Ümumi qazanc</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-2xl font-semibold text-gray-900">
                      {myOrders.filter((o) => o.status === 'accepted' || o.status === 'delivered').reduce((sum, o) => sum + Number(o.price), 0).toFixed(0)} AZN
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Gözləyən ödəniş</p>
                  </div>
                </div>

                {myOrders.filter((o) => o.status === 'completed').length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl py-12 text-center">
                    <p className="text-gray-400 text-sm">
                      Hələ tamamlanan sifarişiniz yoxdur
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tamamlanan sifarişlər</p>
                    <div className="flex flex-col gap-2">
                      {myOrders.filter((o) => o.status === 'completed').map((order) => (
                        <a
                          key={order.id}
                          href={'/sifaris/' + order.id}
                          className="flex justify-between items-center border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition"
                        >
                          <span className="text-sm text-gray-700">{order.gig_title}</span>
                          <span className="text-sm font-semibold text-purple-700">{order.price} AZN</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'partner' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                {profile?.creator_status === 'approved' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🏅</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Sən artıq Frila Creator-san!</h3>
                    <p className="text-gray-500 text-sm">Profilində Creator nişanı görünür.</p>
                  </div>
                ) : profile?.creator_status === 'pending' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">⏳</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Müraciətin nəzərdən keçirilir</h3>
                    <p className="text-gray-500 text-sm">Tezliklə sənə geri dönüş olacaq.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h3 className="font-semibold text-gray-900 text-xl mb-2">🏅 Frila Creator ol</h3>
                      <p className="text-gray-500 text-sm">Frila-nı tanıt, xüsusi imtiyazlar qazan</p>
                    </div>

                    <div className="flex flex-col gap-4 mb-8">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">1</span>
                        <p className="text-sm text-gray-700 pt-1">📌 Frila profil linkini bio-na əlavə et</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">2</span>
                        <p className="text-sm text-gray-700 pt-1">📢 Frila haqqında ən azı 1 paylaşım et</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">3</span>
                        <p className="text-sm text-gray-700 pt-1">🔗 Sosial media profil linkini göndər</p>
                      </div>
                    </div>

                    <form onSubmit={handleCreatorApply} className="flex flex-col gap-3 mb-8">
                      <input
                        type="text"
                        required
                        value={creatorSocialLink}
                        onChange={(e) => setCreatorSocialLink(e.target.value)}
                        placeholder="Instagram / LinkedIn / TikTok profil linki"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                      />
                      <button
                        type="submit"
                        disabled={applyingCreator}
                        className="bg-purple-700 text-white py-2.5 rounded-xl font-medium hover:bg-purple-800 transition-all disabled:opacity-50"
                      >
                        {applyingCreator ? 'Göndərilir...' : 'Müraciət et'}
                      </button>
                    </form>

                    <div className="flex flex-col gap-2 pt-6 border-t border-gray-100">
                      <p className="text-sm text-gray-600 flex items-center gap-2">✔ Profilində xüsusi Creator nişanı görünəcək</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">✔ Axtarış nəticələrində daha çox görünəcəksən</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">✔ Daha çox müştərinin diqqətini çəkəcəksən</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/50 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="text-xl font-semibold text-gray-900 tracking-tight">Frila</a>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Azərbaycanın freelance platforması
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Kateqoriyalar</h4>
            <ul className="flex flex-col gap-2.5">
              {KATEQORIYALAR.map((cat) => (
                <li key={cat}>
                  <a href="/xidmetler" className="text-gray-500 text-sm hover:text-purple-700 transition-colors">{cat}</a>
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
        <div className="border-t border-gray-100 py-6">
          <p className="text-center text-sm text-gray-400">© 2026 Frila. Bütün hüquqlar qorunur.</p>
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
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}