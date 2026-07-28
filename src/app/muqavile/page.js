export default function Muqavile() {
  return (
    <main className="min-h-screen bg-white antialiased">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            <img src="/frila.png" alt="Frila" className="h-8 w-auto" />
          </a>
          <a href="/qeydiyyat" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Qeydiyyata qayıt
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">İstifadə Şərtləri</h1>
        <p className="text-gray-400 text-sm mb-10">Son yenilənmə: 2026</p>

        <div className="flex flex-col gap-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Ümumi müddəalar</h2>
            <p>
              Frila platformasından istifadə edərək, siz bu şərtləri qəbul etmiş sayılırsınız.
              Platforma, sifarişçiləri (müştəriləri) və freelancerləri (xidmət təqdim edənləri)
              bir araya gətirən vasitəçi rolunu oynayır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Hesab yaratma</h2>
            <p>
              İstifadəçi qeydiyyat zamanı təqdim etdiyi məlumatların düzgünlüyünə görə məsuliyyət daşıyır.
              Hər istifadəçi yalnız bir hesab yarada bilər. Hesab məlumatlarının (şifrə daxil olmaqla)
              gizli saxlanılması istifadəçinin öz məsuliyyətindədir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Xidmətlərin (gig) yerləşdirilməsi</h2>
            <p>
              Freelancerlər tərəfindən yerləşdirilən xidmətlər qanuni, dəqiq və yanıltıcı olmayan
              məlumatlar əsasında olmalıdır. Platforma, qaydaları pozan məzmunu xəbərdarlıq etmədən
              silmək hüququnu özündə saxlayır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Sifariş və ödəniş</h2>
            <p>
              Sifariş verildikdən sonra hər iki tərəf (sifarişçi və freelancer) platforma daxilindəki
              status axınına (gözləyir, icra olunur, təhvil verilib, tamamlanıb) əməl etməlidir.
              Platformadan kənar əlaqə və ödəniş təklifləri qadağandır və şikayət predmeti ola bilər.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Davranış qaydaları</h2>
            <p>
              İstifadəçilər bir-birinə hörmətlə davranmalı, təhqiredici, aldadıcı və ya qanunsuz
              davranışdan çəkinməlidir. Bu qaydaların pozulması hesabın müvəqqəti və ya daimi
              bloklanmasına səbəb ola bilər.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Məsuliyyətin məhdudlaşdırılması</h2>
            <p>
              Frila, istifadəçilər arasında baş verən mübahisələrdə vasitəçi rolunu oynayır, lakin
              işin keyfiyyətinə və ya nəticəsinə görə birbaşa məsuliyyət daşımır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Dəyişikliklər</h2>
            <p>
              Bu şərtlər zaman-zaman yenilənə bilər. Əhəmiyyətli dəyişikliklər barədə istifadəçilər
              məlumatlandırılacaq.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}