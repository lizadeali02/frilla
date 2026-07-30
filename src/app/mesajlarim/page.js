'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

function formatLastSeen(dateStr) {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 2) return 'Onlayn'
  if (diffMin < 60) return diffMin + ' dəq əvvəl'
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return diffHour + ' saat əvvəl'
  const diffDay = Math.floor(diffHour / 24)
  return diffDay + ' gün əvvəl'
}

function formatMessageTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit' }) + ' · ' +
    d.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
}

export default function Mesajlarim() {
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/giris')
      return
    }
    setUser(user)

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

    if (!orders || orders.length === 0) {
      setConversations([])
      setLoading(false)
      return
    }

    const orderIds = orders.map((o) => o.id)

    const { data: allMessages } = await supabase
      .from('order_messages')
      .select('*')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false })

    const otherPartyIds = orders.map((o) => (o.buyer_id === user.id ? o.seller_id : o.buyer_id))
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, last_seen')
      .in('id', otherPartyIds)

    const profileMap = {}
    ;(profiles || []).forEach((p) => { profileMap[p.id] = p })

    const conversationList = orders.map((order) => {
      const otherId = order.buyer_id === user.id ? order.seller_id : order.buyer_id
      const otherProfile = profileMap[otherId]
      const lastMessage = (allMessages || []).find((m) => m.order_id === order.id)

      return {
        order,
        otherProfile,
        lastMessage,
        sortTime: lastMessage ? lastMessage.created_at : order.created_at,
      }
    })

    conversationList.sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime))

    setConversations(conversationList)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white antialiased">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-10 w-auto" />
          </a>
          <nav className="flex gap-3 sm:gap-6 items-center text-sm sm:text-[15px]">
            <a href="/xidmetler" className="text-gray-500 hover:text-gray-900 transition-colors">Xidmətlər</a>
            <a href="/profilim" className="text-gray-500 hover:text-gray-900 transition-colors">Profilim</a>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-6">Mesajlarım</h1>

        {loading ? (
          <p className="text-gray-400">Yüklənir...</p>
        ) : conversations.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-16 text-center">
            <p className="text-gray-500 mb-1">Hələ heç bir söhbətiniz yoxdur.</p>
            <a href="/xidmetler" className="text-purple-700 text-sm font-medium hover:underline">Xidmətlərə bax</a>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map(({ order, otherProfile, lastMessage }) => (
              <a
                key={order.id}
                href={'/sifaris/' + order.id}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="relative flex-shrink-0">
                  {otherProfile?.avatar_url ? (
                    <img src={otherProfile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-700 text-white flex items-center justify-center font-semibold">
                      {(otherProfile?.full_name || '?')[0]}
                    </div>
                  )}
                  {formatLastSeen(otherProfile?.last_seen) === 'Onlayn' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900 text-sm truncate">{otherProfile?.full_name}</p>
                    {lastMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0">{formatMessageTime(lastMessage.created_at)}</span>
                    )}
                  </div>
                  <p className="text-xs text-purple-600 font-medium mb-0.5 truncate">{order.gig_title}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage
                      ? (lastMessage.content || (lastMessage.file_name ? '📎 ' + lastMessage.file_name : ''))
                      : 'Hələ mesaj yoxdur'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}