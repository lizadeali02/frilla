export default function Qaydalar() {
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

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-10">Platforma Qaydaları</h1>

        <div className="flex flex-col gap-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Freelancerlər üçün</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Xidmət təsviri dəqiq və yanıltıcı olmamalıdır</li>
              <li>Portfolio şəkillərində əlaqə məlumatı (telefon, e-poçt, sosial media) olmamalıdır</li>
              <li>Sifarişləri razılaşdırılmış müddətdə təhvil verin</li>
              <li>Müştərilərlə hörmətli və peşəkar ünsiyyət saxlayın</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sifarişçilər üçün</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Sifariş tələblərini aydın və ətraflı izah edin</li>
              <li>Freelancerə işi tamamlamaq üçün kifayət qədər vaxt verin</li>
              <li>Ədalətli və dürüst rəy yazın</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Qadağan olunan davranışlar</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <li>Platformadan kənar ödəniş və ya əlaqə təklif etmək</li>
              <li>Saxta profil və ya xidmət yaratmaq</li>
              <li>Təhqiredici, ayrı-seçkilik xarakterli davranış</li>
              <li>Müəllif hüquqlarını pozan məzmun paylaşmaq</li>
            </ul>
            <p className="mt-3 text-sm text-gray-500">
              Bu qaydaların pozulması hesabın xəbərdarlıq edilmədən bloklanmasına səbəb ola bilər.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}