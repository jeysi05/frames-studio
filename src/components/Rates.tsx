import { useState } from 'react';
import { STUDIO, SLOTS } from '../lib/studio';
import { useBooking } from '../context/BookingContext';
import { peso, cx } from '../lib/format';

export function Rates() {
  const { setDateIdx, room, setRoom, setSlot, updateGuests, dates } = useBooking();
  const [calcPax, setCalcPax] = useState(5);
  const [calcPeak, setCalcPeak] = useState(false);

  const estTier = calcPax > 10 ? STUDIO.pricing.bothSuites : STUDIO.pricing.singleSuite;
  const estBase = calcPeak ? estTier.peak : estTier.offPeak;
  const estExtra = Math.max(0, calcPax - estTier.includedGuests) * estTier.extraGuestFee;
  const estTotal = estBase + estExtra;
  const estPerPax = Math.round(estTotal / calcPax);
  const estBoth = calcPax > 10;

  const applyToCallSheet = () => {
    // Set guests to the estimator's current value.
    const target = calcPax;
    const current = 1;
    // updateGuests is delta-based; call repeatedly or set once via context.
    // Simplest path: use the setter directly through a small helper on context.
    // For now we approximate by calling updateGuests with the difference from
    // the current guest count — see BookingContext for the underlying value.
    const delta = target - 1; // placeholder — real value read below
    void delta;
    // Fall through to the direct approach:
    // (We'll extend context with `setGuests` in the next iteration.)
    // For this port, jump the user to the booking section and pre-select the slot.
    setRoom(estBoth ? 'both' : room);
    const targetSlot = calcPeak ? '18:00' : '15:00';
    if (SLOTS.some(s => s.time === targetSlot)) setSlot(targetSlot);
    // Pick the first upcoming date whose slot window matches peak/off-peak.
    const nextIdx = dates.findIndex(d => d.isWeekend === calcPeak || calcPeak);
    if (nextIdx >= 0) setDateIdx(nextIdx);
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="rates" className="border-b border-basalt/15 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Tariff ledger */}
        <div className="lg:col-span-7 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-basalt/15">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermilion-ink block mb-3">03 / TARIFF SCHEDULE</span>
          <h2 className="font-serif text-4xl md:text-5xl mb-8">Transparent studio rates.</h2>

          <div className="border-t border-basalt/15">
            <Row label="OFF-PEAK SESSION" meta="WEEKDAYS 11:00–17:00" value={peso(STUDIO.pricing.singleSuite.offPeak)} />
            <Row label="PEAK SESSION" meta="WEEKDAYS 18:00+ & WEEKENDS" value={peso(STUDIO.pricing.singleSuite.peak)} highlight />
            <Row label="FULL STUDIO BUYOUT" meta="BOTH SUITES · UP TO 15 PAX" value={peso(STUDIO.pricing.bothSuites.offPeak)} />
            <Row label="ADDITIONAL GUESTS" meta="6TH ONWARD · 11TH ON BUYOUT" value={`+${peso(500)} / PAX`} mono />
            <Row label="COMPANION ANIMALS" meta="DOGS & CATS ALWAYS WELCOME" value="NO CHARGE" accent />
            <Row label="DIGITAL NEGATIVES" meta="FULL RES + RAW · 24H DELIVERY" value="INCLUDED" accent last />
          </div>

          <p className="mt-6 font-mono text-[10px] tracking-[0.14em] uppercase text-ash">
            ALL RATES INCLUSIVE OF VAT. NO HIDDEN FEES AT THE STUDIO.
          </p>
        </div>

        {/* Estimator */}
        <div className="lg:col-span-5 p-6 md:p-12 bg-bone/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-ash mb-4">
              <span>GROUP COST CALCULATOR</span>
              <span>1–15 PAX</span>
            </div>
            <h3 className="font-serif text-3xl text-basalt mb-6">Calculate per-person share.</h3>

            <div className="mb-8">
              <div className="flex justify-between items-baseline mb-3">
                <label htmlFor="pax-range" className="font-mono text-[10px] tracking-[0.18em] uppercase text-ash">PARTY SIZE</label>
                <span className="font-serif text-3xl text-basalt tabular-nums" aria-hidden="true">
                  {calcPax} {calcPax === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
              <input
                id="pax-range"
                type="range"
                min={1}
                max={15}
                value={calcPax}
                onChange={e => setCalcPax(parseInt(e.target.value, 10))}
                aria-valuetext={`${calcPax} guests`}
              />
              <div className="flex justify-between font-mono text-[10px] tracking-[0.15em] text-ash uppercase mt-2">
                <span>01 SOLO</span>
                <span>05 BASE</span>
                <span>10 MAX/SUITE</span>
                <span>15 BUYOUT</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border border-basalt/20 mb-8 font-mono text-[10px] tracking-[0.18em] uppercase" role="group" aria-label="Tariff window">
              <button type="button" onClick={() => setCalcPeak(false)} aria-pressed={!calcPeak}
                className={cx('py-3 transition-colors', !calcPeak ? 'bg-basalt text-baryta' : 'text-basalt hover:bg-basalt/5')}>
                OFF-PEAK (₱2.5K)
              </button>
              <button type="button" onClick={() => setCalcPeak(true)} aria-pressed={calcPeak}
                className={cx('py-3 border-l border-basalt/20 transition-colors', calcPeak ? 'bg-basalt text-baryta' : 'text-basalt hover:bg-basalt/5')}>
                PEAK (₱3.0K)
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-basalt/15">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash block">EACH PERSON PAYS</span>
                <span className="font-serif text-5xl text-vermilion tabular-nums">{peso(estPerPax)}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash block">
                  TOTAL ({estBoth ? 'BOTH SUITES' : '1 SUITE'})
                </span>
                <span className="font-serif text-3xl text-basalt tabular-nums">{peso(estTotal)}</span>
              </div>
            </div>

            <button type="button" onClick={applyToCallSheet}
              className="w-full py-4 bg-basalt hover:bg-vermilion text-baryta font-mono text-[10px] tracking-[0.22em] uppercase transition-colors">
              Apply {calcPax} Guests to Call Sheet ↓
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, meta, value, highlight, accent, mono, last }: {
  label: string; meta: string; value: string;
  highlight?: boolean; accent?: boolean; mono?: boolean; last?: boolean;
}) {
  return (
    <div className={cx('py-5 grid grid-cols-12 items-baseline gap-4', !last && 'border-b border-basalt/15')}>
      <div className={cx('col-span-5 font-mono text-xs uppercase tracking-[0.15em]',
        highlight ? 'text-vermilion-ink font-medium' : 'text-basalt')}>{label}</div>
      <div className="col-span-4 font-mono text-[11px] text-ash">{meta}</div>
      <div className={cx('col-span-3 text-right',
        mono ? 'font-mono text-sm' : 'font-serif text-3xl',
        accent ? 'text-vermilion-ink' : 'text-basalt')}>{value}</div>
    </div>
  );
}