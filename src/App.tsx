// src/App.tsx
import { ToastProvider } from './hooks/useToast';
import { BookingProvider, useBooking } from './context/BookingContext';
import { useMobileBar } from './hooks/useMobileBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Ethos } from './components/Ethos';
import { Suites } from './components/Suites';
import { Proof } from './components/Proof';
import { Rates } from './components/Rates';
import { Booking } from './components/Booking';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { Toast } from './components/ui/Toast';
import { peso } from './lib/format';

const SHEET_URL =
  (import.meta as any).env?.VITE_SHEET_URL ||
  'https://docs.google.com/spreadsheets/d/1y0Wb15QJuibtbk1mPwGp-IhKMl2vQDWIi_uBGLexMcs/edit?usp=sharing';

function OwnerPitchBar() {
  const { staffBlocked2PM, toggleStaffBlock2PM, setCustomer, setGuests, setHasPets } = useBooking();

  const handleTriggerGCalBlock = () => {
    document.getElementById('slot-matrix')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!staffBlocked2PM) toggleStaffBlock2PM();
  };

  const handleQuickFillAndScroll = () => {
    setCustomer({ name: 'Andrea Reyes', phone: '0917 882 4109', email: 'andrea.reyes@gmail.com' });
    setGuests(6);
    setHasPets(true);
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-basalt text-baryta border-b border-baryta/15 font-mono text-[10px] tracking-[0.16em] uppercase">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 bg-vermilion animate-pulse" aria-hidden="true" />
          <span>FRAMES OWNER DEMO · PAYMONGO LIVE API × 2-WAY G-CAL × GOOGLE SHEETS</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleTriggerGCalBlock}
            className="underline decoration-baryta/40 hover:decoration-vermilion hover:text-vermilion transition-colors"
          >
            {staffBlocked2PM ? '[01. UNBLOCK 02:00 PM]' : '[01. SIMULATE STAFF G-CAL BLOCK]'}
          </button>
          <button
            type="button"
            onClick={handleQuickFillAndScroll}
            className="underline decoration-baryta/40 hover:decoration-vermilion hover:text-vermilion transition-colors"
          >
            [02. LOAD SAMPLE 6-PAX BOOKING]
          </button>
          <a
            href={SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-vermilion text-baryta font-medium hover:bg-baryta hover:text-basalt transition-colors"
          >
            OPEN LIVE GOOGLE SHEET ↗
          </a>
        </div>
      </div>
    </div>
  );
}

function MobileReserveBar() {
  const show = useMobileBar('booking');
  const { guests, price } = useBooking();
  if (!show) return null;
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-basalt text-baryta border-t border-baryta/15 px-4 py-3 flex items-center justify-between gap-4">
      <div>
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-baryta/60">TOTAL · {guests} PAX</div>
        <div className="font-serif text-2xl tabular-nums leading-tight">{peso(price.total)}</div>
      </div>
      <a href="#booking" className="px-6 py-3.5 bg-vermilion text-baryta font-mono text-[10px] tracking-[0.2em] uppercase shrink-0">
        Reserve →
      </a>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BookingProvider>
        <div className="min-h-screen flex flex-col">
          <div className="film-grain" aria-hidden="true" />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-3 focus:left-3 focus:bg-basalt focus:text-baryta focus:px-4 focus:py-2.5 focus:font-mono focus:text-[11px] focus:tracking-[0.2em] focus:uppercase"
          >
            Skip to content
          </a>
          <OwnerPitchBar />
          <Header />
          <main id="main">
            <Hero />
            <Ethos />
            <Suites />
            <Proof />
            <Rates />
            <Booking />
            <Faq />
          </main>
          <Footer />
          <MobileReserveBar />
          <Toast />
        </div>
      </BookingProvider>
    </ToastProvider>
  );
}