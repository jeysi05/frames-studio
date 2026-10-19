import { STUDIO, TESTIMONIALS } from '../lib/studio';

export function Proof() {
  if (!TESTIMONIALS || TESTIMONIALS.length === 0) return null;

  return (
    <section aria-labelledby="proof-heading" className="border-b border-basalt/15 bg-bone/30">
      <div className="max-w-[1400px] mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermilion-ink block mb-3">GUEST LOG</span>
            <h2 id="proof-heading" className="font-serif text-4xl md:text-5xl">What people say after.</h2>
          </div>
          <a href={STUDIO.contact.instagramUrl} target="_blank" rel="noopener noreferrer"
             className="font-mono text-[11px] tracking-[0.18em] uppercase text-basalt underline underline-offset-4 hover:text-vermilion-ink transition-colors">
            SEE MORE ON INSTAGRAM · {STUDIO.contact.instagram} ↗
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-basalt/20">
          {TESTIMONIALS.map(p => (
            <blockquote key={p.id} className="p-6 md:p-8 border-r border-b border-basalt/20 flex flex-col justify-between">
              <p className="font-serif text-2xl leading-snug text-basalt mb-6">"{p.quote}"</p>
              <footer className="pt-4 border-t border-basalt/15">
                <div className="font-mono text-xs uppercase tracking-[0.16em] text-basalt">{p.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash mt-1">{p.meta}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}