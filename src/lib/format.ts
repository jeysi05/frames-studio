export const cx = (...a: unknown[]) => a.filter(Boolean).join(' ');
export const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;
