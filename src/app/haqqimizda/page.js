export default function Haqqimizda() {
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
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-6">Bizim haqqımızda</h1>
        <div className="flex flex-col gap-6 text-gray-700 leading-relaxed">
          <p>
            Frila, Azərbaycanda freelancer və sifarişçiləri bir araya gətirən müasir bir
            marketplace platformasıdır. Missiyamız — istedadlı freelancerlərin bacarıqlarını
            asanlıqla nümayiş etdirə bilməsi, sifarişçilərin isə etibarlı və keyfiyyətli
            xidmətlərə rahat çıxış əldə etməsidir.
          </p>
          <p>
            Qrafik dizayndan proqramlaşdırmaya, video montajdan rəqəmsal marketinqə qədər
            geniş bir sahədə minlərlə xidmət platformamızda təqdim olunur.
          </p>
          <p>
            Təhlükəsiz sifariş sistemi, daxili çat, rəy və reytinq mexanizmi ilə hər iki
            tərəf üçün şəffaf və etibarlı bir iş mühiti yaradırıq.
          </p>
        </div>
      </div>
    </main>
  )
}