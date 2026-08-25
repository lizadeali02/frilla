'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'


const TIER_META = {
  basic: { label: 'Basic', accent: 'border-gray-200', badge: null, chip: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  standard: { label: 'Standard', accent: 'border-purple-500 ring-2 ring-purple-100', badge: 'Ən çox seçilən', chip: 'bg-purple-50 text-purple-700', dot: 'bg-purple-600' },
  premium: { label: 'Premium', accent: 'border-amber-300', badge: null, chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
}

const emptyPackage = { description: '', price: '', delivery_days: '', revision_count: '', features: '' }

function SectionHeader({ number, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
          {number}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

function PackageCard({ tier, data, onChange }) {
  const meta = TIER_META[tier]
  return (
    <div className={"bg-white rounded-2xl border-2 " + meta.accent + " p-5 relative flex flex-col"}>
      {meta.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-700 text-white text-xs font-semibold rounded-full whitespace-nowrap shadow-sm">
          {meta.badge}
        </span>
      )}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
        <span className="font-semibold text-gray-900">{meta.label}</span>
      </div>

      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Təsvir</label>
      <textarea
        required rows={2} value={data.description}
        onChange={(e) => onChange('description', e.target.value)}
        className="w-full mt-1.5 mb-3.5 px-3 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
        placeholder="Bu paketdə nə təklif edirsən?"
      />

      <div className="grid grid-cols-2 gap-3 mb-3.5">
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Qiymət</label>
          <div className="relative mt-1.5">
            <input
              type="number" required min="1" step="0.01" value={data.price}
              onChange={(e) => onChange('price', e.target.value)}
              className="w-full px-3 py-2.5 pr-11 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">AZN</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Müddət</label>
          <div className="relative mt-1.5">
            <input
              type="number" required min="1" value={data.delivery_days}
              onChange={(e) => onChange('delivery_days', e.target.value)}
              className="w-full px-3 py-2.5 pr-11 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="3"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">gün</span>
          </div>
        </div>
      </div>

      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Düzəliş sayı</label>
      <input
        type="number" required min="0" value={data.revision_count}
        onChange={(e) => onChange('revision_count', e.target.value)}
        className="w-full mt-1.5 mb-3.5 px-3 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
        placeholder="2"
      />

      <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Nə daxil olur</label>
      <textarea
        rows={3} value={data.features}
        onChange={(e) => onChange('features', e.target.value)}
        className="w-full mt-1.5 px-3 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none flex-1"
        placeholder="PNG formatı, Kaynak fayl, Ticari istifadə"
      />
    </div>
  )
}

export default function XidmetElaveEt() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [checking, setChecking] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mainCategories, setMainCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [mainCategoryId, setMainCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [images, setImages] = useState([])
    const [extras, setExtras] = useState([])
  const [newExtraTitle, setNewExtraTitle] = useState('')
  const [newExtraPrice, setNewExtraPrice] = useState('')
  const [newExtraDays, setNewExtraDays] = useState('')
    const [video, setVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  const [activeTiers, setActiveTiers] = useState(['basic'])
  const [packages, setPackages] = useState({
    basic: { ...emptyPackage },
    standard: { ...emptyPackage },
    premium: { ...emptyPackage },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    setUser(user)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profileData)
    const { data: mainCatsData } = await supabase
      .from('main_categories')
      .select('*')
      .order('sort_order', { ascending: true })
    setMainCategories(mainCatsData || [])
    if (mainCatsData && mainCatsData.length > 0) {
      setMainCategoryId(mainCatsData[0].id)
    }

    const { data: subCatsData } = await supabase
      .from('subcategories')
      .select('*')
      .order('name', { ascending: true })
    setSubcategories(subCatsData || [])
    setChecking(false)
  }

  const updatePackage = (tier, field, value) => {
    setPackages((prev) => ({
      ...prev,
      [tier]: { ...prev[tier], [field]: value },
    }))
  }

  const addTier = (tier) => {
    setActiveTiers((prev) => [...prev, tier])
  }

  const removeTier = (tier) => {
    setActiveTiers((prev) => prev.filter((t) => t !== tier))
    setPackages((prev) => ({ ...prev, [tier]: { ...emptyPackage } }))
  }

     const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setError('')

    files.forEach((file) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        const ratio = img.width / img.height
        const targetRatio = 3 / 2
        const tolerance = 0.05

        if (Math.abs(ratio - targetRatio) > tolerance) {
          setError(
            `"${file.name}" (${img.width}x${img.height}) düzgün ölçüdə deyil. ` +
            `Kapak şəkilləri 3:2 nisbətində olmalıdır — tövsiyə olunan ölçü: 1200x800px (və ya 1920x1280px). ` +
            `Bu formatda şəkil yükləyin.`
          )
          window.scrollTo({ top: 0, behavior: 'smooth' })
          URL.revokeObjectURL(url)
          return
        }

        setImages((prev) => [...prev, { file, preview: url }])
      }

      img.onerror = () => {
        setError(`"${file.name}" faylı şəkil kimi açıla bilmədi. Zəhmət olmasa düzgün şəkil faylı seçin.`)
        URL.revokeObjectURL(url)
      }

      img.src = url
    })

    e.target.value = ''
  }
  
  const addExtra = () => {
    if (!newExtraTitle.trim() || !newExtraPrice) return
    setExtras((prev) => [...prev, {
      title: newExtraTitle.trim(),
      price: newExtraPrice,
      extra_days: newExtraDays || '0',
    }])
    setNewExtraTitle('')
    setNewExtraPrice('')
    setNewExtraDays('')
  }

  const removeExtra = (index) => {
    setExtras((prev) => prev.filter((_, i) => i !== index))
  }

  
  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      setError('Video 50MB-dan kiçik olmalıdır')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setVideo(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const removeVideo = () => {
    setVideo(null)
    setVideoPreview(null)
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    for (const tier of activeTiers) {
      const pkg = packages[tier]
      if (!pkg.description || !pkg.price || !pkg.delivery_days || !pkg.revision_count) {
        setError('Zəhmət olmasa "' + TIER_META[tier].label + '" paketinin bütün sahələrini doldurun')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    }

    setLoading(true)

    const selectedMainCat = mainCategories.find((c) => c.id === mainCategoryId)
    const selectedSubCat = subcategories.find((c) => c.id === subcategoryId)
    const categoryLabel = selectedSubCat ? selectedMainCat?.name + ' — ' + selectedSubCat.name : selectedMainCat?.name

    const { data: gigData, error: gigError } = await supabase
      .from('gigs')
      .insert({
        user_id: user.id,
        title,
        description,
        category: categoryLabel,
        price: parseFloat(packages.basic.price),
      })
      .select()
      .single()

    if (gigError) {
      setLoading(false)
      setError('Xəta baş verdi: ' + gigError.message)
      return
    }

    const packageRows = activeTiers.map((tier) => ({
      gig_id: gigData.id,
      tier,
      title: TIER_META[tier].label,
      description: packages[tier].description,
      price: parseFloat(packages[tier].price),
      delivery_days: parseInt(packages[tier].delivery_days),
      revision_count: parseInt(packages[tier].revision_count),
      features: packages[tier].features,
    }))

    const { error: packagesError } = await supabase.from('gig_packages').insert(packageRows)

    if (packagesError) {
      setLoading(false)
      setError('Paketlər əlavə edilərkən xəta: ' + packagesError.message)
      return
    }

        if (extras.length > 0) {
      const extraRows = extras.map((ex) => ({
        gig_id: gigData.id,
        title: ex.title,
        price: parseFloat(ex.price),
        extra_days: parseInt(ex.extra_days) || 0,
      }))
      await supabase.from('gig_extras').insert(extraRows)
    }

    for (let i = 0; i < images.length; i++) {
      const file = images[i].file
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${gigData.id}/${Date.now()}_${i}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('gig-images')
        .upload(filePath, file)

      if (uploadError) {
        setLoading(false)
        setError('Şəkil yüklənərkən xəta: ' + uploadError.message)
        return
      }

      const { data: urlData } = supabase.storage.from('gig-images').getPublicUrl(filePath)

      await supabase.from('gig_images').insert({
        gig_id: gigData.id,
        image_url: urlData.publicUrl,
        sort_order: i,
      })
    }

    if (video) {
      setUploadingVideo(true)
      const videoExt = video.name.split('.').pop()
      const videoPath = `${user.id}/${gigData.id}/video.${videoExt}`

      const { error: videoUploadError } = await supabase.storage
        .from('gig-images')
        .upload(videoPath, video)

      if (!videoUploadError) {
        const { data: videoUrlData } = supabase.storage.from('gig-images').getPublicUrl(videoPath)
        await supabase.from('gigs').update({ video_url: videoUrlData.publicUrl }).eq('id', gigData.id)
      }
      setUploadingVideo(false)
    }

    setLoading(false)
    router.push('/gig/' + gigData.id)
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Yüklənir...</p>
      </main>
    )
  }

  if (profile?.role !== 'freelancer') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Bu səhifə yalnız freelancerlər üçündür
          </h1>
          <p className="text-gray-500 mb-6">
            Xidmət əlavə etmək üçün əvvəlcə freelancer olmalısınız.
          </p>
          <a href="/profilim" className="inline-block px-6 py-2.5 bg-purple-700 text-white rounded-full font-medium hover:bg-purple-800 transition-colors">
            Profilimə keç
          </a>
        </div>
      </main>
    )
  }

  const inactiveTiers = ['standard', 'premium'].filter((t) => !activeTiers.includes(t))

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

      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-2">Yeni xidmət əlavə et</h1>
          <p className="text-gray-500">Xidmətini təsvir et, şəkillər əlavə et və qiymət paketlərini müəyyən et</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-5 py-4 mb-6">
            {error}
          </div>
        )}

        {/* 1. Əsas məlumatlar */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6">
          <SectionHeader number="1" title="Əsas məlumatlar" subtitle="Xidmətinin adı, kateqoriyası və təsviri" />
          <div className="flex flex-col gap-5 pl-12">
            <div>
              <label className="text-sm text-gray-700 font-medium">Xidmətin adı</label>
              <input
                type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-[15px]"
                placeholder="Məs: Peşəkar loqo dizaynı hazırlayacağam"
              />
            </div>
             <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-700 font-medium">Əsas kateqoriya</label>
                <select
                  value={mainCategoryId}
                  onChange={(e) => { setMainCategoryId(e.target.value); setSubcategoryId('') }}
                  className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-[15px] bg-white"
                >
                  {mainCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700 font-medium">Alt kateqoriya</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-[15px] bg-white"
                >
                  <option value="">Seç (istəyə bağlı)</option>
                  {subcategories.filter((s) => s.main_category_id === mainCategoryId).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>



            <div>
              <label className="text-sm text-gray-700 font-medium">Ümumi təsvir</label>
              <textarea
                required value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none text-[15px] leading-relaxed"
                placeholder="Xidmətin haqqında ətraflı məlumat ver — nə edirsən, təcrübən nədir, müştəri nə gözləməlidir"
              />
            </div>
          </div>
        </div>

        {/* 2. Şəkillər (istəyə bağlı) */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6">
          <SectionHeader
            number="2"
            title="Kapak şəkilləri"
            subtitle="İstəyə bağlı — şəkil əlavə etsən xidmətin daha diqqətçəkici görünəcək"
          />
          <div className="pl-12">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-purple-700 text-white text-[10px] rounded-full font-semibold">
                      Əsas şəkil
                    </span>
                  )}
                </div>
              ))}

<label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition">
                <div className="text-center">
                  <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-500 font-medium">Əlavə et</span>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleImagesSelect} className="hidden" />
              </label>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm text-gray-700 font-medium mb-1">Təqdimat videosu (istəyə bağlı, maks 1 ədəd)</p>
              <p className="text-xs text-gray-400 mb-3">Maks 50MB</p>

              {videoPreview ? (
                <div className="relative w-full max-w-xs">
                  <video src={videoPreview} controls className="w-full rounded-2xl border border-gray-100" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="inline-block px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition">
                  🎬 Video yüklə
                  <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* 3. Paketlər */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6">
          <SectionHeader number="3" title="Qiymət paketləri" subtitle="Basic mütləqdir, əlavə paketlər istəyə bağlıdır" />

          <div className="grid md:grid-cols-3 gap-5">
            <PackageCard
              tier="basic"
              data={packages.basic}
              onChange={(field, value) => updatePackage('basic', field, value)}
            />

            {activeTiers.includes('standard') ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => removeTier('standard')}
                  className="absolute -top-2.5 -right-2.5 z-10 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition"
                >
                  ✕
                </button>
                <PackageCard
                  tier="standard"
                  data={packages.standard}
                  onChange={(field, value) => updatePackage('standard', field, value)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addTier('standard')}
                className="rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 py-10 hover:border-purple-400 hover:bg-purple-50/40 transition min-h-[280px]"
              >
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Standard paket əlavə et?</span>
                <span className="text-xs text-gray-400 px-6 text-center">Müştərilərə orta səviyyəli seçim təklif et</span>
              </button>
            )}

            {activeTiers.includes('premium') ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => removeTier('premium')}
                  className="absolute -top-2.5 -right-2.5 z-10 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition"
                >
                  ✕
                </button>
                <PackageCard
                  tier="premium"
                  data={packages.premium}
                  onChange={(field, value) => updatePackage('premium', field, value)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addTier('premium')}
                className="rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 py-10 hover:border-amber-400 hover:bg-amber-50/40 transition min-h-[280px]"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Premium paket əlavə et?</span>
                <span className="text-xs text-gray-400 px-6 text-center">Ən yüksək səviyyəli, tam xidmət paketi təklif et</span>
              </button>
            )}
          </div>
 </div>

        {/* 4. Ekstra xidmətlər */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 mb-6">
          <SectionHeader
            number="4"
            title="Ekstra xidmətlər"
            subtitle="İstəyə bağlı — müştərilər əlavə ödəniş qarşılığında əlavə xidmətlər sifariş edə bilər"
          />

          <div className="pl-12">
            {extras.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {extras.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-2.5">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{ex.title}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        +{ex.price} AZN{Number(ex.extra_days) > 0 && ` · +${ex.extra_days} gün`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExtra(i)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-2">
              <input
                type="text"
                value={newExtraTitle}
                onChange={(e) => setNewExtraTitle(e.target.value)}
                placeholder="Ekstra ad (məs: Sürətli çatdırılma)"
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              <input
                type="number"
                value={newExtraPrice}
                onChange={(e) => setNewExtraPrice(e.target.value)}
                placeholder="Qiymət (AZN)"
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition w-full sm:w-32"
              />
              <input
                type="number"
                value={newExtraDays}
                onChange={(e) => setNewExtraDays(e.target.value)}
                placeholder="+gün (0)"
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition w-full sm:w-24"
              />
              <button
                type="button"
                onClick={addExtra}
                className="px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-100 transition"
              >
                + Əlavə et
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-purple-700 text-white py-4 rounded-2xl font-semibold hover:bg-purple-800 transition-all disabled:opacity-50 shadow-lg shadow-purple-200 text-[15px]"
        >
          {loading ? 'Yüklənir, gözləyin...' : 'Xidməti əlavə et'}
        </button>
      </form>
    </main>
  )
}