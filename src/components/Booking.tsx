// src/components/Booking.tsx
import { useEffect, useState } from 'react';
import { STUDIO, SLOTS, SUITES, type SuiteKey } from '../lib/studio';
import { useBooking } from '../context/BookingContext';
import { useToast } from '../hooks/useToast';
import { useAvailability } from '../hooks/useAvailability';
import { Field } from './ui/Field';
import { Modal } from './ui/Modal';
import { peso, cx } from '../lib/format';

const PAYMONGO_PUBLIC_KEY =
  (import.meta as any).env?.VITE_PAYMONGO_PUBLIC_KEY || 'pk_test_BY7BSZ3PgAxHXaQybTr5CTi5';
const SHEET_URL =
  (import.meta as any).env?.VITE_SHEET_URL ||
  'https://docs.google.com/spreadsheets/d/1y0Wb15QJuibtbk1mPwGp-IhKMl2vQDWIi_uBGLexMcs/edit?usp=sharing';
const WEBHOOK_URL =
  (import.meta as any).env?.VITE_SHEETS_WEBHOOK_URL ||
  'https://script.google.com/macros/s/AKfycbyuzT8GENvan-lWxsZ088Qn6fjKIkkUzulKZZFdXVngMS-o5Bl7VjYpbpFSTnPgzhifSQ/exec';

const PENDING_STORAGE_KEY = 'frames.pending.booking.v1';

interface LastBooking {
  ref: string;
  checkoutUrl?: string | null;
  roomName: string;
  dateTime: string;
  guests: number;
  hasPets: boolean;
  payChannel: string;
  totalStr: string;
  customer: { name: string; phone: string; email: string };
}

export function Booking() {
  const {
    dates,
    dateIdx,
    setDateIdx,
    room,
    setRoom,
    slot,
    setSlot,
    guests,
    updateGuests,
    hasPets,
    setHasPets,
    customer,
    setCustomer,
    staffBlocked2PM,
    toggleStaffBlock2PM,
    bookedSlots,
    markSlotBooked,
    price,
  } = useBooking();

  const { flash } = useToast();
  const curDate = dates[dateIdx] ?? dates[0];
  const { availability, loading: availLoading } = useAvailability(curDate.iso);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [modal, setModal] = useState<null | 'paymongo' | 'receipt' | 'policy'>(null);
  const [receiptTab, setReceiptTab] = useState<'customer' | 'staff'>('customer');
  const [payChannel, setPayChannel] = useState('GCash');
  const [policyKey, setPolicyKey] = useState('cancellation');
  const [lastBooking, setLastBooking] = useState<LastBooking | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pmCheckoutUrl, setPmCheckoutUrl] = useState<string | null>(null);
  const [pmError, setPmError] = useState<string | null>(null);

  const slotObj = SLOTS.find(s => s.time === slot) ?? SLOTS[4];

  // Detect return from PayMongo Hosted Test Checkout (?pm_status=success)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('pm_status');
    if (!status) return;

    const raw = localStorage.getItem(PENDING_STORAGE_KEY);
    if (status === 'success' && raw) {
      try {
        const saved: LastBooking = JSON.parse(raw);
        setLastBooking(saved);
        setReceiptTab('customer');
        setModal('receipt');
        flash(`PAYMONGO AUTHORISED (${saved.ref})`);
        localStorage.removeItem(PENDING_STORAGE_KEY);
      } catch {}
    } else if (status === 'failed') {
      flash('PAYMONGO TEST PAYMENT MARKED AS FAILED');
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [flash]);

  const errors = {
    name: customer.name.trim().length < 2 ? 'Enter the name on the booking.' : '',
    phone: customer.phone.replace(/\D/g, '').length < 10 ? 'Enter a mobile number we can reach you on.' : '',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email.trim())
      ? 'Enter a valid email for the calendar invite.'
      : '',
  };
  const formValid = !errors.name && !errors.phone && !errors.email;

  const isSlotUnavailable = (suite: SuiteKey, time: string) => {
    if (staffBlocked2PM && time === '14:00') return true;
    if ((bookedSlots[curDate.iso] || []).includes(time)) return true;
    if (!availability) return false;
    return availability[suite]?.[time] === false;
  };

  const openCheckout = () => {
    setSubmitAttempted(true);
    if (!formValid) {
      const firstBad = ['name', 'phone', 'email'].find(k => errors[k as keyof typeof errors]);
      document.getElementById(`field-${firstBad}`)?.focus();
      flash('PLEASE COMPLETE THE GUEST MANIFEST');
      return;
    }
    setPmCheckoutUrl(null);
    setPmError(null);
    setModal('paymongo');
  };

  // Calls live PayMongo API (pk_test_BY7BSZ3PgAxHXaQybTr5CTi5) + logs to Google Sheets
  const authorize = async () => {
    setProcessing(true);
    setPmError(null);

    const dateTime = `${curDate.formatted} · ${slotObj.label}`;
    const totalStr = peso(price.total);
    const cleanUrl = window.location.href.split('?')[0];

    try {
      let ref = `PM_${Math.floor(100000 + Math.random() * 899999)}`;
      let checkoutUrl: string | null = null;

      // Call PayMongo /v1/sources directly using pk_test_BY7BSZ3PgAxHXaQybTr5CTi5
      const authHeader = 'Basic ' + btoa(`${PAYMONGO_PUBLIC_KEY}:`);
      const sourceType = payChannel === 'GCash' ? 'gcash' : 'grab_pay';

      const pmRes = await fetch('https://api.paymongo.com/v1/sources', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(price.total * 100),
              currency: 'PHP',
              type: sourceType,
              redirect: {
                success: `${cleanUrl}?pm_status=success`,
                failed: `${cleanUrl}?pm_status=failed`,
              },
              billing: {
                name: customer.name.trim(),
                phone: customer.phone.trim(),
                email: customer.email.trim(),
              },
              metadata: {
                studio: 'FRAMES Makati',
                room: SUITES[room].name,
                dateTime,
                guests: String(guests),
                pets: hasPets ? 'Yes' : 'No',
                channel: payChannel,
              },
            },
          },
        }),
      });

      const pmJson = await pmRes.json();
      if (!pmRes.ok) {
        throw new Error(pmJson?.errors?.[0]?.detail || 'PayMongo API error');
      }

      ref = pmJson.data.id; // Real PayMongo ID (`src_...`)
      checkoutUrl = pmJson.data.attributes?.redirect?.checkout_url || null;

      const record: LastBooking = {
        ref,
        checkoutUrl,
        roomName: SUITES[room].name,
        dateTime,
        guests,
        hasPets,
        payChannel,
        totalStr,
        customer: { ...customer },
      };

      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(record));

      // Log all 8 columns to your Google Sheet via Apps Script Webhook
      const sheetPayload = {
        timestamp: new Date().toLocaleString('en-PH'),
        room: SUITES[room].name,
        dateTime,
        date: curDate.formatted,
        slot: slotObj.label,
        rateType: price.isPeak ? 'Peak' : 'Off-Peak',
        guests: `${guests} pax${hasPets ? ' + Pet' : ''}`,
        pets: hasPets ? 'Yes' : 'No',
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        customerEmail: customer.email.trim(),
        paymentMethod: payChannel,
        total: totalStr,
        totalAmount: price.total,
        paymongoRef: ref,
        ref,
        status: 'PAID & G-CAL SYNCED',
      };

      fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(sheetPayload),
      }).catch(() => {});

      markSlotBooked(curDate.iso, slot);
      setLastBooking(record);
      setPmCheckoutUrl(checkoutUrl);
      setProcessing(false);
    } catch (err: any) {
      setPmError(err?.message || 'Could not reach PayMongo API.');
      setProcessing(false);
    }
  };

  const autofillDemo = () => {
    setCustomer({ name: 'Andrea Reyes', phone: '0917 882 4109', email: 'andrea.reyes@gmail.com' });
    setTouched({ name: true, phone: true, email: true });
    flash('SAMPLE GUEST LOADED');
  };

  return (
    <section id="booking" className="border-b border-basalt/15 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-basalt/15">
          <div className="p-6 md:p-10 border-b border-basalt/15 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermilion-ink block mb-2">
                04 / RESERVATION CALL SHEET
              </span>
              <h2 className="font-serif text-4xl md:text-5xl">Configure your session.</h2>
            </div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash">
              PAYMONGO LIVE API · 2-WAY G-CAL SYNC
            </span>
          </div>

          {/* 01 — environment */}
          <fieldset className="p-6 md:p-10 border-b border-basalt/15">
            <legend className="sr-only">Select environment</legend>
            <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-ash mb-4">
              <span>01 / SELECT ENVIRONMENT</span>
              <span className="text-basalt">{SUITES[room].name}</span>
            </div>
            <div className="grid grid-cols-3 border border-basalt/20">
              {(['concrete', 'white', 'both'] as const).map((rKey, i) => (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => setRoom(rKey)}
                  aria-pressed={room === rKey}
                  className={cx(
                    'p-3 sm:p-4 text-left transition-colors',
                    i > 0 && 'border-l border-basalt/20',
                    room === rKey ? 'bg-basalt text-baryta' : 'bg-baryta text-basalt hover:bg-bone'
                  )}
                >
                  <div className="font-serif text-lg sm:text-2xl">{SUITES[rKey].short}</div>
                  <div
                    className={cx(
                      'font-mono text-[10px] tracking-[0.16em] uppercase mt-1',
                      room === rKey ? 'text-baryta/70' : 'text-ash'
                    )}
                  >
                    {rKey === 'both' ? 'UP TO 15 PAX' : 'UP TO 10 PAX'}
                  </div>
                </button>
              ))}
            </div>
          </fieldset>

          {/* 02 — date */}
          <fieldset className="p-6 md:p-10 border-b border-basalt/15">
            <legend className="sr-only">Date of shoot</legend>
            <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-ash mb-4">
              <span>02 / DATE OF SHOOT</span>
              <span className={price.isPeak ? 'text-vermilion-ink' : 'text-basalt'}>
                {price.isPeak ? 'PEAK TARIFF WINDOW' : 'OFF-PEAK TARIFF WINDOW'}
              </span>
            </div>
            <div className="flex sm:grid sm:grid-cols-7 border border-basalt/20 overflow-x-auto">
              {dates.map((d, idx) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => setDateIdx(idx)}
                  aria-pressed={idx === dateIdx}
                  className={cx(
                    'shrink-0 w-[74px] sm:w-auto p-3.5 text-center transition-colors',
                    idx > 0 && 'border-l border-basalt/20',
                    idx === dateIdx ? 'bg-basalt text-baryta' : 'bg-baryta text-basalt hover:bg-bone'
                  )}
                >
                  <div className={cx('font-mono text-[10px] tracking-[0.18em]', idx === dateIdx ? 'text-baryta/70' : 'text-ash')}>
                    {d.dayName}
                  </div>
                  <div className="font-serif text-2xl leading-tight mt-0.5">{d.dateNum}</div>
                  <div className={cx('font-mono text-[9px] tracking-[0.14em] mt-0.5', idx === dateIdx ? 'text-baryta/60' : 'text-ash')}>
                    {d.monthName}
                  </div>
                </button>
              ))}
            </div>
          </fieldset>

          {/* 03 — time */}
          <fieldset id="slot-matrix" className="p-6 md:p-10 border-b border-basalt/15">
            <legend className="sr-only">Time slot</legend>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash">
                03 / TIME SLOT {availLoading ? '(SYNCING G-CAL…)' : ''}
              </span>
              <button
                type="button"
                onClick={toggleStaffBlock2PM}
                className="font-mono text-[10px] tracking-[0.16em] uppercase text-vermilion-ink underline underline-offset-4"
              >
                {staffBlocked2PM ? '[UNBLOCK 02:00 PM ON STAFF G-CAL]' : '[OWNER TEST: BLOCK 02:00 PM ON STAFF G-CAL]'}
              </button>
            </div>

            {staffBlocked2PM && (
              <div className="mb-4 p-3 bg-bone border-l-2 border-vermilion font-mono text-[10px] tracking-[0.12em] text-basalt">
                2-WAY G-CAL PROOF: Staff blocked 02:00 PM on their Google Calendar app. Website immediately locks 02:00 PM.
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 border-t border-l border-basalt/20">
              {SLOTS.map(s => {
                const isStaffBlocked = staffBlocked2PM && s.time === '14:00';
                const unavailable = isSlotUnavailable(room, s.time);
                const isSel = slot === s.time && !unavailable;
                const slotIsPeak =
                  curDate.isWeekend || parseInt(s.time.split(':')[0], 10) >= STUDIO.pricing.peakRules.eveningStartHour;

                return (
                  <button
                    key={s.time}
                    type="button"
                    disabled={unavailable}
                    aria-pressed={isSel}
                    onClick={() => setSlot(s.time)}
                    className={cx(
                      'p-3.5 text-left border-r border-b border-basalt/20 transition-colors',
                      unavailable
                        ? 'bg-bone/60 text-ash/50 cursor-not-allowed'
                        : isSel
                        ? 'bg-basalt text-baryta'
                        : 'bg-baryta text-basalt hover:bg-bone'
                    )}
                  >
                    <div className={cx('font-mono text-xs', unavailable ? 'line-through' : 'font-medium')}>{s.label}</div>
                    <div
                      className={cx(
                        'font-mono text-[10px] tracking-[0.16em] uppercase mt-1',
                        isStaffBlocked
                          ? 'text-vermilion-ink'
                          : unavailable
                          ? 'text-ash/50'
                          : isSel
                          ? 'text-vermilion'
                          : 'text-ash'
                      )}
                    >
                      {isStaffBlocked
                        ? 'STAFF G-CAL BUSY'
                        : unavailable
                        ? 'RESERVED'
                        : slotIsPeak
                        ? `PEAK · ${peso(STUDIO.pricing.singleSuite.peak)}`
                        : `OFF-PEAK · ${peso(STUDIO.pricing.singleSuite.offPeak)}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* 04 — headcount + pets */}
          <div className="p-6 md:p-10 border-b border-basalt/15 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash block mb-1">04 / HEADCOUNT</span>
              <p className="text-sm text-basalt">First {price.includedGuests} guests included · +₱500 per extra guest</p>
              <div className="mt-3 inline-flex items-center border border-basalt/25">
                <button
                  type="button"
                  onClick={() => updateGuests(-1)}
                  disabled={guests <= 1}
                  aria-label="Remove one guest"
                  className="w-11 h-11 font-mono text-lg hover:bg-basalt hover:text-baryta disabled:opacity-30 transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center font-mono text-sm tabular-nums" aria-live="polite">
                  {guests}
                </span>
                <button
                  type="button"
                  onClick={() => updateGuests(1)}
                  disabled={guests >= 15}
                  aria-label="Add one guest"
                  className="w-11 h-11 font-mono text-lg hover:bg-basalt hover:text-baryta disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="sm:border-l border-basalt/15 sm:pl-6">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash block mb-1">COMPANION ANIMAL</span>
              <p className="text-sm text-basalt">Bringing a dog or cat? Free studio prep included.</p>
              <button
                type="button"
                onClick={() => setHasPets(!hasPets)}
                aria-pressed={hasPets}
                className={cx(
                  'mt-3 px-4 py-2.5 border border-basalt/25 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors',
                  hasPets ? 'bg-basalt text-baryta' : 'bg-baryta text-basalt hover:bg-bone'
                )}
              >
                {hasPets ? '[X] YES — BRINGING PET' : '[ ] NO PETS'}
              </button>
            </div>
          </div>

          {/* 05 — guest manifest */}
          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash">05 / GUEST MANIFEST</span>
              <button
                type="button"
                onClick={autofillDemo}
                className="font-mono text-[10px] tracking-[0.18em] uppercase text-vermilion-ink underline underline-offset-4"
              >
                [AUTO-FILL SAMPLE GUEST]
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                id="field-name"
                label="Full name *"
                type="text"
                autoComplete="name"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, name: true }))}
                placeholder="Andrea Reyes"
                aria-invalid={Boolean((touched.name || submitAttempted) && errors.name)}
              />
              <Field
                id="field-phone"
                label="Mobile (Viber / GCash) *"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                placeholder="0917 882 4109"
                aria-invalid={Boolean((touched.phone || submitAttempted) && errors.phone)}
              />
              <div className="sm:col-span-2">
                <Field
                  id="field-email"
                  label="Email address (calendar invite + file delivery) *"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={customer.email}
                  onChange={e => setCustomer({ ...customer, email: e.target.value })}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  placeholder="andrea.reyes@gmail.com"
                  aria-invalid={Boolean((touched.email || submitAttempted) && errors.email)}
                />
              </div>
            </div>

            <div aria-live="polite" className="mt-4 space-y-1.5">
              {submitAttempted &&
                (['name', 'phone', 'email'] as const).map(
                  k =>
                    errors[k] && (
                      <p key={k} className="font-mono text-[10px] tracking-[0.15em] text-vermilion-ink">
                        {errors[k].toUpperCase()}
                      </p>
                    )
                )}
            </div>
          </div>
        </div>

        {/* Dossier */}
        <aside className="lg:col-span-5 bg-basalt text-baryta p-6 md:p-10 lg:sticky lg:top-16 self-start flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] uppercase text-baryta/60 pb-4 border-b border-baryta/15">
              <span>CALL SHEET DOSSIER</span>
              <span className="text-vermilion">PAYMONGO LIVE API</span>
            </div>

            <div className="my-6 aspect-[16/9] overflow-hidden border border-baryta/15 relative">
              <img
                src={`https://images.unsplash.com/photo-${SUITES[room].imgIdFallback ?? '1531746020798-e6953c6e8e04'}?auto=format&fit=crop&q=78&w=960`}
                alt=""
                width={960}
                height={540}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover grade-color"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-basalt/90 font-mono text-[10px] tracking-[0.2em] uppercase">
                {SUITES[room].name}
              </div>
            </div>

            <dl className="space-y-3.5 font-mono text-xs border-y border-baryta/15 py-6">
              <Row label="ENVIRONMENT" value={SUITES[room].name} />
              <Row label="DATE & TIME" value={`${curDate.formatted} · ${slotObj.label}`} />
              <Row
                label="TARIFF RATE"
                value={`${price.isPeak ? 'PEAK' : 'OFF-PEAK'} (${peso(price.base)})`}
                highlight={price.isPeak}
              />
              <Row label="PARTY MANIFEST" value={`${guests} PAX${hasPets ? ' + PET' : ''}`} />
              {price.extraGuests > 0 && (
                <Row label={`EXTRA GUESTS (${price.extraGuests})`} value={`+${peso(price.extraFee)}`} />
              )}
              <Row label="DIGITAL NEGATIVES" value="INCLUDED" accent />
            </dl>
          </div>

          <div className="pt-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-baryta/60">TOTAL DUE</span>
              <span className="font-serif text-5xl tabular-nums">{peso(price.total)}</span>
            </div>
            <div className="text-right font-mono text-[10px] tracking-[0.18em] uppercase text-vermilion mb-6">
              ≈ {peso(price.perPerson)} PER PERSON ({guests} PAX)
            </div>

            <button
              type="button"
              onClick={openCheckout}
              className="w-full py-4 bg-vermilion hover:bg-baryta hover:text-basalt text-baryta font-mono text-[11px] tracking-[0.22em] uppercase transition-colors"
            >
              Proceed to PayMongo Checkout →
            </button>
          </div>
        </aside>
      </div>

      {/* PayMongo Live API Modal */}
      <Modal open={modal === 'paymongo'} onClose={() => !processing && setModal(null)} labelledBy="paymongo-title">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-basalt/15 font-mono text-[10px] tracking-[0.2em] uppercase">
            <span id="paymongo-title">PAYMONGO API · {PAYMONGO_PUBLIC_KEY.slice(0, 12)}…</span>
            <button
              type="button"
              onClick={() => !processing && setModal(null)}
              disabled={processing}
              className="hover:text-vermilion disabled:opacity-40"
            >
              [CLOSE ✕]
            </button>
          </div>

          <div className="pb-6 mb-6 border-b border-basalt/15 flex justify-between items-baseline gap-4">
            <div>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ash">{SUITES[room].name}</div>
              <div className="font-mono text-xs text-basalt mt-1">
                {curDate.formatted} · {slotObj.label}
              </div>
              <div className="font-mono text-[10px] text-ash mt-1">
                {guests} PAX{hasPets ? ' + PET' : ''}
              </div>
            </div>
            <div className="font-serif text-4xl text-basalt tabular-nums">{peso(price.total)}</div>
          </div>

          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash mb-3">SELECT PAYMENT CHANNEL</div>
          <div className="grid grid-cols-2 border-t border-l border-basalt/25 mb-6" role="group" aria-label="Payment channel">
            {['GCash', 'Maya', 'QR Ph', 'Card'].map(ch => (
              <button
                key={ch}
                type="button"
                onClick={() => {
                  setPayChannel(ch);
                  setPmCheckoutUrl(null);
                }}
                aria-pressed={payChannel === ch}
                disabled={processing}
                className={cx(
                  'p-3.5 border-r border-b border-basalt/25 font-mono text-xs uppercase tracking-[0.15em] flex justify-between transition-colors',
                  payChannel === ch ? 'bg-basalt text-baryta' : 'bg-baryta text-basalt hover:bg-bone'
                )}
              >
                <span>{ch}</span>
                <span className="text-[9px] opacity-60">LIVE API</span>
              </button>
            ))}
          </div>

          {pmError && (
            <div className="mb-4 p-3 border border-vermilion bg-vermilion/10 font-mono text-[10px] text-vermilion-ink uppercase">
              {pmError}
            </div>
          )}

          {!pmCheckoutUrl ? (
            <button
              type="button"
              onClick={authorize}
              disabled={processing}
              className="w-full py-4 bg-vermilion hover:bg-basalt text-baryta font-mono text-[11px] tracking-[0.22em] uppercase transition-colors disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {processing ? (
                <>
                  <span className="inline-block w-3 h-3 border border-baryta border-t-transparent animate-spin" />
                  CONNECTING TO API.PAYMONGO.COM…
                </>
              ) : (
                <>Generate Live {payChannel} Source ({peso(price.total)}) →</>
              )}
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-bone border border-basalt/20 font-mono text-[10px] space-y-1">
                <div className="text-vermilion-ink font-medium">✓ PAYMONGO SOURCE CREATED & LOGGED TO GOOGLE SHEET</div>
                <div className="text-basalt">PayMongo ID: {lastBooking?.ref}</div>
              </div>

              <a
                href={pmCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setReceiptTab('customer');
                  setModal('receipt');
                }}
                className="block w-full py-4 bg-vermilion hover:bg-basalt text-baryta font-mono text-[11px] tracking-[0.2em] uppercase text-center transition-colors"
              >
                1. Open Official PayMongo Test Checkout ↗
              </a>

              <button
                type="button"
                onClick={() => {
                  setReceiptTab('staff');
                  setModal('receipt');
                }}
                className="w-full py-3.5 bg-basalt hover:bg-vermilion text-baryta font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
              >
                2. View Staff Google Calendar & Sheets Sync →
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Dual-Tab Receipt + Staff Sync Modal */}
      <Modal
        open={modal === 'receipt' && Boolean(lastBooking)}
        onClose={() => setModal(null)}
        labelledBy="receipt-title"
        maxWidth="max-w-xl"
      >
        {lastBooking && (
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-basalt/15">
              <div className="flex border border-basalt/25 font-mono text-[10px] tracking-[0.16em] uppercase">
                <button
                  type="button"
                  onClick={() => setReceiptTab('customer')}
                  className={cx(
                    'px-3.5 py-2 transition-colors',
                    receiptTab === 'customer' ? 'bg-basalt text-baryta' : 'text-basalt hover:bg-bone'
                  )}
                >
                  01 / GUEST RECEIPT
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptTab('staff')}
                  className={cx(
                    'px-3.5 py-2 border-l border-basalt/25 transition-colors',
                    receiptTab === 'staff' ? 'bg-vermilion text-baryta' : 'text-vermilion-ink hover:bg-bone'
                  )}
                >
                  02 / STAFF G-CAL & SHEETS SYNC
                </button>
              </div>
              <button type="button" onClick={() => setModal(null)} className="font-mono text-xs hover:text-vermilion">
                [✕]
              </button>
            </div>

            {receiptTab === 'customer' ? (
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-vermilion-ink block mb-1">
                  PAYMONGO VERIFIED · G-CAL LOCKED
                </span>
                <h3 id="receipt-title" className="font-serif text-4xl text-basalt mb-4">
                  Your session is confirmed.
                </h3>

                <dl className="border-y border-basalt/15 py-4 my-5 space-y-2.5 font-mono text-xs">
                  <Row2 label="PAYMONGO ID" value={lastBooking.ref} />
                  <Row2 label="SUITE" value={lastBooking.roomName} />
                  <Row2 label="DATE & TIME" value={lastBooking.dateTime} />
                  <Row2 label="PARTY" value={`${lastBooking.guests} PAX${lastBooking.hasPets ? ' + PET' : ''}`} />
                  <Row2 label="EMAIL" value={lastBooking.customer.email} />
                  <Row2 label="TOTAL" value={`${lastBooking.totalStr} VIA ${lastBooking.payChannel.toUpperCase()}`} accent />
                </dl>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px] tracking-[0.18em] uppercase">
                  <button
                    type="button"
                    onClick={() => setReceiptTab('staff')}
                    className="py-3.5 bg-basalt hover:bg-vermilion text-baryta transition-colors"
                  >
                    See Staff G-Cal Event →
                  </button>
                  <a
                    href={SHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 bg-vermilion text-baryta text-center hover:bg-basalt transition-colors"
                  >
                    Open Live Google Sheet ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="border border-basalt/25 bg-bone/50 p-5 font-mono text-xs space-y-2.5">
                  <div className="text-[10px] tracking-[0.2em] uppercase text-vermilion-ink">
                    1. AUTO-CREATED ON FRAMES STAFF GOOGLE CALENDAR
                  </div>
                  <div className="font-sans font-semibold text-base text-basalt">
                    [{lastBooking.roomName.toUpperCase()}] {lastBooking.customer.name} ({lastBooking.guests} Pax
                    {lastBooking.hasPets ? ' + Pet' : ''})
                  </div>
                  <div className="text-ash">{lastBooking.dateTime} (45m shoot + 15m reset buffer)</div>
                  <div className="pt-2 border-t border-basalt/15 text-basalt">
                    PAID {lastBooking.totalStr} via PayMongo ({lastBooking.payChannel}) · ID: {lastBooking.ref}
                  </div>
                  <div className="text-ash">
                    Contact: {lastBooking.customer.phone} · {lastBooking.customer.email}
                  </div>
                </div>

                <div className="border border-basalt/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="font-mono text-xs">
                    <div className="text-[10px] tracking-[0.2em] uppercase text-vermilion-ink">
                      2. LOGGED TO GOOGLE SHEETS LEDGER
                    </div>
                    <div className="text-basalt mt-1">
                      {lastBooking.customer.name} · {lastBooking.dateTime} · {lastBooking.totalStr}
                    </div>
                  </div>
                  <a
                    href={SHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-basalt hover:bg-vermilion text-baryta font-mono text-[10px] tracking-[0.2em] uppercase shrink-0 text-center transition-colors"
                  >
                    Open Live Google Sheet ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Policy modal */}
      <Modal open={modal === 'policy'} onClose={() => setModal(null)} labelledBy="policy-title" maxWidth="max-w-lg">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-basalt/15 font-mono text-[10px] tracking-[0.2em] uppercase">
            <span>STUDIO POLICY</span>
            <button type="button" onClick={() => setModal(null)} className="hover:text-vermilion">
              [CLOSE ✕]
            </button>
          </div>
          <h3 id="policy-title" className="font-serif text-3xl text-basalt mb-4">
            {policyTitle(policyKey)}
          </h3>
          <p className="text-sm text-basalt/75 leading-relaxed">
            More than 48 hours before your slot: full refund or one free reschedule. Arrive 5 minutes prior to your scheduled session.
          </p>
        </div>
      </Modal>
    </section>
  );
}

function Row({ label, value, highlight, accent }: { label: string; value: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-baryta/60 uppercase">{label}</dt>
      <dd className={cx('text-right', highlight && 'text-vermilion', accent && 'text-vermilion')}>{value}</dd>
    </div>
  );
}

function Row2({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ash">{label}</dt>
      <dd className={cx('text-right', accent && 'text-vermilion-ink')}>{value}</dd>
    </div>
  );
}

function policyTitle(key: string) {
  const map: Record<string, string> = {
    cancellation: 'Cancellation & Rescheduling',
    arrival: 'Arrival & Late Policy',
    delivery: 'File Delivery & Usage',
    privacy: 'Privacy & Data',
  };
  return map[key] ?? 'Studio Policy';
}