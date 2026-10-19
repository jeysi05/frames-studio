export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-baryta/95 backdrop-blur-md border-b border-basalt/15">
      <div className="max-w-[1400px] mx-auto grid grid-cols-12 items-center">
        <a href="#" className="col-span-6 md:col-span-3 px-4 md:px-8 py-4 border-r border-basalt/15 flex items-baseline justify-between">
          <span className="font-serif text-2xl tracking-tight text-basalt">FRAMES</span>
          <span className="font-mono text-[10px] tracking-[0.22em] text-ash uppercase">MAKATI</span>
        </a>
        <nav aria-label="Sections" className="hidden md:flex md:col-span-6 px-8 py-4 items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-ash border-r border-basalt/15">
          <a href="#ethos"   className="hover:text-basalt transition-colors">01 / Ethos</a>
          <a href="#suites"  className="hover:text-basalt transition-colors">02 / Suites</a>
          <a href="#rates"   className="hover:text-basalt transition-colors">03 / Rates</a>
          <a href="#booking" className="hover:text-basalt transition-colors">04 / Call Sheet</a>
          <a href="#faq"     className="hover:text-basalt transition-colors">05 / Index</a>
        </nav>
        <div className="col-span-6 md:col-span-3 flex items-center justify-end">
          <a href="#booking" className="w-full py-4 px-6 bg-basalt hover:bg-vermilion text-baryta font-mono text-[10px] tracking-[0.22em] uppercase text-center transition-colors">
            Reserve Session →
          </a>
        </div>
      </div>
    </header>
  );
}