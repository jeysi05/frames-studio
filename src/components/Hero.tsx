import { useState } from 'react';
import { STUDIO, IMAGES, SRC, SRCSET, CONTACT_LAYOUTS } from '../lib/studio';
import { cx } from '../lib/format';

export function Hero() {
  const [mono, setMono] = useState(false);

  return (
    <section className="border-b border-basalt/15">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 p-6 md:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-basalt/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-ash pb-6 border-b border-basalt/15">
              <span>{STUDIO.address.street.toUpperCase()} · {STUDIO.address.area.toUpperCase()}</span>
              <span>{STUDIO.hours.display}</span>
            </div>

            <h1 className="mt-10 font-serif text-[clamp(3.4rem,7vw,6.8rem)] leading-[0.88] tracking-[-0.03em] text-basalt">
              Take your<br />
              own <span className="italic text-vermilion">portraits.</span>
            </h1>

            <p className="mt-8 text-base md:text-lg text-basalt/80 leading-relaxed max-w-md">
              A private self-portrait studio in Makati where you hold the shutter release. No photographer in the room. No live screen to make you self-conscious. Forty-five uninterrupted minutes with your friends, your partner, or your dog.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-basalt/15">
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-basalt/15">
              <div>
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ash block">BASE SESSION (UP TO 5 PAX)</span>
                <span className="font-serif text-4xl md:text-5xl text-basalt">₱2,500</span>
              </div>
              <div className="border-l border-basalt/15 pl-4 flex flex-col justify-between">
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-vermilion-ink">GROUP SPLIT (5 FRIENDS)</span>
                <span className="font-mono text-lg font-medium text-basalt">₱500 / PERSON</span>
                <span className="font-mono text-[10px] text-ash">ALL FILES INCLUDED · PETS FREE</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="#booking" className="flex-1 py-4 px-6 bg-vermilion hover:bg-basalt text-baryta font-mono text-[11px] tracking-[0.2em] uppercase text-center transition-colors">
                Book 45-Min Session →
              </a>
              <a href="#suites" className="py-4 px-6 border border-basalt text-basalt hover:bg-basalt hover:text-baryta font-mono text-[11px] tracking-[0.2em] uppercase text-center transition-colors">
                Inspect Suites
              </a>
            </div>

            <p className="mt-4 font-mono text-[10px] tracking-[0.14em] uppercase text-ash">
              FREE RESCHEDULE UP TO 48H · INSTANT CONFIRMATION
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 md:p-10 bg-bone/50 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-basalt/15 font-mono text-[10px] tracking-[0.2em] uppercase">
            <span className="text-ash">CONTACT SHEET // ARCHIVE_2026</span>
            <div className="flex items-center gap-4" role="group" aria-label="Image grading">
              <button type="button" onClick={() => setMono(false)} aria-pressed={!mono}
                className={mono ? 'text-ash hover:text-basalt' : 'text-vermilion-ink underline underline-offset-4'}>
                [COLOUR STOCK]
              </button>
              <button type="button" onClick={() => setMono(true)} aria-pressed={mono}
                className={mono ? 'text-vermilion-ink underline underline-offset-4' : 'text-ash hover:text-basalt'}>
                [MONOCHROME]
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-start">
            {IMAGES.contactSheet.map((frame, i) => {
              const layout = CONTACT_LAYOUTS[frame.layout] ?? CONTACT_LAYOUTS.wide;
              return (
                <figure key={frame.id} className={layout.span}>
                  <div className="flex justify-between font-mono text-[10px] tracking-[0.18em] text-ash mb-1.5">
                    <span>FRM_{frame.id}</span>
                    <span>GODOX PARABOLIC</span>
                  </div>
                  <div className={cx(layout.aspect, 'overflow-hidden bg-basalt border border-basalt/15')}>
                    <img
                      src={SRC(frame.unsplashId, 1200)}
                      srcSet={SRCSET(frame.unsplashId)}
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      alt={frame.title}
                      width={1200} height={900}
                      loading={i < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      className={cx('w-full h-full object-cover hover:scale-[1.03]', mono || frame.stock === 'bw' ? 'grade-bw' : 'grade-color')}
                    />
                  </div>
                  <figcaption className="mt-2 font-mono text-[10px] tracking-[0.15em] uppercase text-basalt/80">
                    {frame.title}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}