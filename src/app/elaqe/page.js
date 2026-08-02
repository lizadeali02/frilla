'use client'

import { useState } from 'react'

export default function Elaqe() {
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <main className="min-h-screen bg-white antialiased">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-8 w-auto" />
          </a>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Ana səhifə</a>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">Əlaqə</h1>
        <p className="text-gray-500 mb-8">Sualınız var? Bizə yazın, tezliklə cavablandıracağıq.</p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-green-700 font-medium">Mesajınız göndərildi, təşəkkür edirik!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-gray-600 font-medium">Ad Soyad</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">E-poçt</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">Mesajınız</label>
              <textarea
                required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              />
            </div>
            <button
              type="submit"
              className="mt-2 bg-purple-700 text-white py-2.5 rounded-xl font-medium hover:bg-purple-800 transition-all"
            >
              Göndər
            </button>
          </form>
        )}
      </div>
    </main>
  )
}