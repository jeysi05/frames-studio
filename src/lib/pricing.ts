import { STUDIO, type SuiteKey } from './studio';

export interface PriceInput { suite: SuiteKey; dateISO: string; slot: string; guests: number; }

export function isPeak(dateISO: string, slot: string): boolean {
  const d = new Date(`${dateISO}T12:00:00+08:00`);
  const isWeekend = [0, 6].includes(d.getDay());
  const hour = parseInt(slot.split(':')[0], 10);
  return isWeekend || hour >= STUDIO.pricing.peakRules.eveningStartHour;
}

export function calculatePrice({ suite, dateISO, slot, guests }: PriceInput) {
  const p = STUDIO.pricing;
  const tier = suite === 'both' ? p.bothSuites : p.singleSuite;
  const peak = isPeak(dateISO, slot);
  const base = peak ? tier.peak : tier.offPeak;
  const extra = Math.max(0, guests - tier.includedGuests);
  const extraFee = extra * tier.extraGuestFee;
  const total = base + extraFee;
  return { base, extraFee, extraGuests: extra, total, perPerson: Math.round(total / guests), isPeak: peak, includedGuests: tier.includedGuests, maxGuests: tier.maxGuests };
}
