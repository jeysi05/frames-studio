
import { STUDIO } from '../lib/studio';

const FAQS = [
  { id: '01', q: 'Are all digital negatives included without watermark?', a: 'Every frame triggered during your 45-minute session is delivered in uncompressed full resolution via a private archive link within 24 hours. Zero per-photo surcharges, no watermarks, no upsells.' },
  { id: '02', q: 'Why is there no live preview monitor inside the studio?', a: 'A live screen turns subjects into critics. Removing the monitor eliminates posture checking and self-consciousness, keeping your attention on the people in the room with you. You get a wireless shutter release and a 15-second review window between takes if you want it.' },
  { id: '03', q: 'What is the policy on dogs and companion animals?', a: 'Pets are welcome at zero additional cost. Indicate pet attendance on the call sheet so our staff prepares the studio floor and water station before you arrive.' },
  { id: '04', q: 'How are reservations and calendar availability handled?', a: 'Checkout clears via PayMongo (GCash, Maya, QR Ph, Visa/Mastercard). Your slot is locked the moment payment authorises and a calendar invite is emailed to you instantly.' },
  { id: '05', q: 'What should we wear?', a: 'Solid colours separate best against both the concrete and the cyclorama. Avoid fine stripes and dense logos. There is a changing alcove and a steamer in each suite.' },
  { id: '06', q: 'How do we get there, and where do we park?', a: '215 Salcedo Street sits between Legazpi Active Park and Washington Sycip Park. Paid parking is available at the Salcedo Village carpark, roughly a three-minute walk. We are a five-minute walk from Greenbelt 3.' },
];

export function Faq() {
  const a = STUDIO.address;
  return (
    <section id="faq" className="border-b border-basalt/15 scroll-mt-20">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-6 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-basalt/15">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermilion-ink block mb-3">05 / STUDIO INDEX</span>
          <h2 className="font-serif text-4xl md:text-5xl mb-8">Operational notes.</h2>

          <div className="border-t border-basalt/15">
            {FAQS.map((f, i) => (
              <details key={f.id} open={i === 0} className="py-5 border-b border-basalt/15 group">
                <summary className="flex items-baseline justify-between gap-4">
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] text-vermilion-ink">{f.id}</span>
                    <span className="font-serif text-xl md:text-2xl text-basalt">{f.q}</span>
                  </span>
                  <span aria-hidden="true" className="font-mono text-sm text-ash group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 pl-8 text-sm text-basalt/75 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 p-6 md:p-12 bg-bone/30 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-vermilion-ink block mb-3">06 / COORDINATES</span>
            <h2 className="font-serif text-4xl md:text-5xl mb-2">{a.street}</h2>
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash mb-6">
              {a.area.toUpperCase()}, {a.city.toUpperCase()} · {a.coordinates.lat}° N, {a.coordinates.lng}° E
            </p>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8 font-mono text-[11px]">
              <div>
                <dt className="text-ash uppercase tracking-[0.18em] text-[10px] mb-1">STUDIO LINE</dt>
                <dd><a href={`tel:${STUDIO.contact.phone.replace(/\s/g, '')}`} className="text-basalt underline underline-offset-4 hover:text-vermilion-ink">{STUDIO.contact.phone}</a></dd>
              </div>
              <div>
                <dt className="text-ash uppercase tracking-[0.18em] text-[10px] mb-1">EMAIL</dt>
                <dd><a href={`mailto:${STUDIO.contact.email}`} className="text-basalt underline underline-offset-4 hover:text-vermilion-ink">{STUDIO.contact.email}</a></dd>
              </div>
              <div>
                <dt className="text-ash uppercase tracking-[0.18em] text-[10px] mb-1">OPEN</dt>
                <dd className="text-basalt">{STUDIO.hours.display}</dd>
              </div>
              <div>
                <dt className="text-ash uppercase tracking-[0.18em] text-[10px] mb-1">NEAREST</dt>
                <dd className="text-basalt">GREENBELT 3 · 5 MIN WALK</dd>
              </div>
            </dl>
          </div>

          <div className="aspect-[16/10] border border-basalt/20 bg-baryta relative overflow-hidden my-4">
            <svg viewBox="0 0 600 360" className="w-full h-full" role="img" aria-label="Map showing FRAMES Studio on Salcedo Street">
              <line x1="0" y1="180" x2="600" y2="180" stroke="#111110" strokeOpacity="0.12" strokeWidth="14" />
              <line x1="380" y1="0" x2="380" y2="360" stroke="#D83A18" strokeOpacity="0.3" strokeWidth="16" />
              <rect x="40" y="40" width="160" height="110" fill="none" stroke="#111110" strokeOpacity="0.2" />
              <text x="54" y="68" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#615D56" letterSpacing="1.5">LEGAZPI ACTIVE PARK</text>
              <rect x="40" y="210" width="160" height="110" fill="none" stroke="#111110" strokeOpacity="0.2" />
              <text x="54" y="238" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#615D56" letterSpacing="1.5">WASHINGTON SYCIP PARK</text>
              <text x="394" y="34" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#111110" letterSpacing="2">SALCEDO ST</text>
              <circle cx="380" cy="235" r="7" fill="#D83A18" />
              <rect x="220" y="214" width="150" height="42" fill="#111110" />
              <text x="234" y="233" fontFamily="Instrument Serif, serif" fontSize="16" fill="#F4F0EA">FRAMES STUDIO</text>
              <text x="234" y="247" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#D83A18" letterSpacing="1.5">215 SALCEDO</text>
            </svg>
          </div>

          <div className="pt-4 border-t border-basalt/15 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] uppercase">
            <a href={STUDIO.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-vermilion-ink transition-colors">
              IG: {STUDIO.contact.instagram}
            </a>
            <a href={a.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-vermilion-ink underline underline-offset-4">
              OPEN GOOGLE MAPS ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}