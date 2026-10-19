import { useState } from 'react';
import { STUDIO, IMAGES, SUITES, SRC, SRCSET, type SuiteKey } from '../lib/studio';
import { useBooking } from '../context/BookingContext';
import { cx } from '../lib/format';

export function Suites() {
  const [mono, setMono] = useState<Record<string, boolean>>({ concrete: false, white: false });
  const { chooseSuite } = useBooking();

  return (
    <section id="suites" className="border-b border-basalt/15 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="p-6 md:p-12 border-b border-basalt/15 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermilion-ink block mb-3">02 / SHOOTING ENVIRONMENTS</span>
            <h2 className="font-serif text-4xl md:text-6xl leading-[0.92]">Two private suites.</h2>
          </div>
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-ash max-w-md">
            {STUDIO.equipment}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {(['concrete', 'white'] as const).map((key, idx) => {
            const s = SUITES[key];
            const isMono = mono[key];
            const imgId = IMAGES.suites[key].unsplashId;
            return (
              <article key={key} className={cx('p-6 md:p-12 flex flex-col justify-between', idx === 0 && 'border-b lg:border-b-0 lg:border-r border-basalt/15')}>
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-ash mb-4">
                    <span>{s.index}</span>
                    <span>{s.capacity}</span>
                  </div>

                  <div className="relative aspect-[4/3] bg-basalt overflow-hidden border border-basalt/15 mb-6">
                    <img
                      src={SRC(imgId, 960)}
                      srcSet={SRCSET(imgId)}
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      alt={`${s.name} — ${s.spec}`}
                      width={960} height={720}
                      loading="lazy" decoding="async"
                      className={cx('w-full h-full object-cover', isMono ? 'grade-bw' : 'grade-color')}
                    />
                    <button
                      type="button"
                      onClick={() => setMono(p => ({ ...p, [key]: !p[key] }))}
                      aria-pressed={isMono}
                      className="absolute bottom-4 right-4 px-3 py-1.5 bg-basalt/90 text-baryta font-mono text-[10px] tracking-[0.2em] uppercase border border-baryta/20 hover:bg-vermilion transition-colors"
                    >
                      {isMono ? 'VIEW COLOUR GRADE' : 'PREVIEW B&W GRADE'}
                    </button>
                  </div>

                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-vermilion-ink mb-2">{s.spec}</div>
                  <h3 className="font-serif text-4xl text-basalt mb-3">{s.name}</h3>
                  <p className="text-sm text-basalt/80 leading-relaxed mb-8 max-w-lg">{s.desc}</p>
                </div>

                <div className="pt-6 border-t border-basalt/15 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash block">45-MIN SESSION (1–5 PAX)</span>
                    <span className="font-serif text-3xl text-basalt">
                      ₱2,500 <span className="font-mono text-[11px] text-ash uppercase">/ +₱500 PER EXTRA PAX</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => chooseSuite(key as SuiteKey)}
                    className="px-6 py-3.5 bg-basalt hover:bg-vermilion text-baryta font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
                  >
                    Select {s.short} →
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="bg-basalt text-baryta p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermilion block mb-2">
              FULL STUDIO BUYOUT // CONCRETE + WHITE
            </span>
            <h3 className="font-serif text-3xl md:text-5xl">Reserve both suites simultaneously.</h3>
            <p className="mt-2 text-sm text-baryta/70 max-w-xl">
              Designed for groups up to 15 guests, with the first 10 included. Move freely between the Concrete and White setups throughout your 45-minute booking.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-baryta/60 block">DUAL SUITE RATE</span>
              <span className="font-serif text-4xl">
                ₱5,000 <span className="font-mono text-xs text-baryta/60">OFF-PEAK</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => chooseSuite('both')}
              className="px-6 py-4 bg-vermilion hover:bg-baryta hover:text-basalt text-baryta font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
            >
              Reserve Both Suites →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}