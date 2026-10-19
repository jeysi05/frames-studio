import { STUDIO } from '../lib/studio';

export function Footer() {
  return (
    <footer className="bg-basalt text-baryta py-10 px-6 md:px-12 font-mono text-[10px] tracking-[0.2em] uppercase">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span>© {new Date().getFullYear()} {STUDIO.name} {STUDIO.tagline.toUpperCase()} · MAKATI</span>
          <span className="text-baryta/50">PAYMONGO VERIFIED · INSTANT CALENDAR SYNC</span>
        </div>
        <nav aria-label="Policies" className="flex flex-wrap gap-x-6 gap-y-3 text-baryta/70">
          <a href="#faq" className="hover:text-vermilion transition-colors">Studio Index</a>
          <a href="#rates" className="hover:text-vermilion transition-colors">Rates</a>
          <a href="#booking" className="hover:text-vermilion transition-colors">Reserve</a>
          <a href={STUDIO.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-vermilion transition-colors">
            Directions
          </a>
        </nav>
      </div>
    </footer>
  );
}