export default function MexfilikSiyaseti() {
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
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">Məxfilik Siyasəti</h1>
        <p className="text-gray-400 text-sm mb-10">Son yenilənmə: 2026</p>

        <div className="flex flex-col gap-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Topladığımız məlumatlar</h2>
            <p>
              Qeydiyyat zamanı ad, e-poçt ünvanı; profil tamamlandıqda isə bacarıqlar, haqqında
              mətni, təhsil məlumatı və profil şəkli kimi məlumatları toplayırıq. Sifariş və çat
              fəaliyyəti də (mesajlar, göndərilən fayllar) sizin hesabınızla əlaqələndirilərək saxlanılır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Məlumatlardan istifadə</h2>
            <p>
              Toplanan məlumatlar yalnız platformanın funksionallığını təmin etmək (hesab idarəetməsi,
              sifariş axını, bildirişlər) və istifadəçi təcrübəsini yaxşılaşdırmaq üçün istifadə olunur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Məlumatların paylaşılması</h2>
            <p>
              Şəxsi məlumatlarınız üçüncü tərəflərə satılmır. Profil məlumatlarınız (ad, avatar,
              bacarıqlar) digər istifadəçilərə açıq şəkildə göstərilir, çünki bu, platformanın
              əsas funksiyasıdır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Təhlükəsizlik nəzarəti</h2>
            <p>
              Platformanın təhlükəsizliyini və istifadəçilərin etibarlılığını təmin etmək məqsədilə,
              sifarişlər daxilindəki yazışmalar (çat) admin komandası tərəfindən monitorinq oluna bilər.
              Bu, xüsusilə platformadan kənar əməliyyatların qarşısını almaq üçündür.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Məlumatların saxlanması</h2>
            <p>
              Məlumatlarınız hesabınız aktiv olduğu müddətcə saxlanılır. Hesabınızı silmək istəsəniz,
              bizimlə əlaqə saxlaya bilərsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Çərəzlər (Cookies)</h2>
            <p>
              Platforma, giriş sessiyanızı saxlamaq üçün minimal texniki çərəzlərdən istifadə edir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Əlaqə</h2>
            <p>
              Məxfilik siyasəti ilə bağlı suallarınız olarsa, platforma daxilindəki əlaqə vasitələrindən
              istifadə edə bilərsiniz.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}