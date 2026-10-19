import studioJson from '../../config/studio.json';
import imagesJson from '../../config/images.json';
import policiesJson from '../../config/policies.json';
import testimonialsJson from '../../config/testimonials.json';

export type SuiteKey = 'concrete' | 'white' | 'both';

export const STUDIO = studioJson;
export const IMAGES = imagesJson;
export const POLICIES = policiesJson as Record<string, { title: string; body: string[] }>;
export const TESTIMONIALS = testimonialsJson.items as { id: string; quote: string; name: string; meta: string }[];

export const SLOTS: { time: string; label: string }[] = STUDIO.booking.slots.map(t => ({
  time: t,
  label: (STUDIO.booking.slotLabels as Record<string, string>)[t] ?? t,
}));

export const SUITES = STUDIO.suites;

// Tailwind needs literal class strings — map layout tokens here.
export const CONTACT_LAYOUTS: Record<string, { span: string; aspect: string }> = {
  wide: { span: 'col-span-12 md:col-span-7', aspect: 'aspect-[4/3]' },
  tall: { span: 'col-span-6 md:col-span-5',  aspect: 'aspect-[3/4]' },
  duo:  { span: 'col-span-12 md:col-span-7', aspect: 'aspect-[16/10]' },
};

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=78&w=`;
export const SRC = (id: string, w = 960) => `${U(id)}${w}`;
export const SRCSET = (id: string) =>
  [480, 720, 960, 1280, 1600].map(w => `${U(id)}${w} ${w}w`).join(', ');
