// src/context/BookingContext.tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { SLOTS, type SuiteKey } from '../lib/studio';
import { generate7DaySchedule } from '../lib/schedule';
import { calculatePrice } from '../lib/pricing';

interface Customer {
  name: string;
  phone: string;
  email: string;
}

interface BookingState {
  dates: ReturnType<typeof generate7DaySchedule>;
  dateIdx: number;
  setDateIdx: (i: number) => void;
  room: SuiteKey;
  setRoom: (r: SuiteKey) => void;
  slot: string;
  setSlot: (s: string) => void;
  guests: number;
  setGuests: (g: number) => void;
  updateGuests: (delta: number) => void;
  hasPets: boolean;
  setHasPets: (v: boolean) => void;
  customer: Customer;
  setCustomer: (c: Customer) => void;
  staffBlocked2PM: boolean;
  toggleStaffBlock2PM: () => void;
  bookedSlots: Record<string, string[]>;
  markSlotBooked: (dateISO: string, slotTime: string) => void;
  price: ReturnType<typeof calculatePrice>;
  chooseSuite: (k: SuiteKey) => void;
}

const Ctx = createContext<BookingState | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const dates = useMemo(() => generate7DaySchedule(), []);
  const [dateIdx, setDateIdx] = useState(0);
  const [room, setRoom] = useState<SuiteKey>('concrete');
  const [slot, setSlot] = useState('15:00');
  const [guests, setGuests] = useState(2);
  const [hasPets, setHasPets] = useState(false);
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', email: '' });
  const [staffBlocked2PM, setStaffBlocked2PM] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});

  const updateGuests = useCallback((delta: number) => {
    setGuests(g => {
      const next = Math.max(1, Math.min(15, g + delta));
      if (next > 10) setRoom('both');
      return next;
    });
  }, []);

  const toggleStaffBlock2PM = useCallback(() => {
    setStaffBlocked2PM(prev => {
      const next = !prev;
      if (next && slot === '14:00') setSlot('15:00');
      return next;
    });
  }, [slot]);

  const markSlotBooked = useCallback((dateISO: string, slotTime: string) => {
    setBookedSlots(prev => ({
      ...prev,
      [dateISO]: Array.from(new Set([...(prev[dateISO] || []), slotTime])),
    }));
  }, []);

  const chooseSuite = useCallback((k: SuiteKey) => {
    setRoom(k);
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const curDate = dates[dateIdx] ?? dates[0];
  const price = useMemo(
    () => calculatePrice({ suite: room, dateISO: curDate.iso, slot, guests }),
    [room, curDate.iso, slot, guests]
  );

  const value: BookingState = {
    dates,
    dateIdx,
    setDateIdx,
    room,
    setRoom,
    slot,
    setSlot,
    guests,
    setGuests,
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
    chooseSuite,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBooking() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useBooking must be used inside BookingProvider');
  return v;
}

export const SLOT_LABELS = Object.fromEntries(SLOTS.map(s => [s.time, s.label]));