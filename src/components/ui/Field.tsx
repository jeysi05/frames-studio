import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  id: string;
}

export function Field({ label, hint, id, ...props }: Props) {
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-[10px] tracking-[0.2em] uppercase text-ash mb-1.5">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full bg-transparent border-b border-basalt/30 focus:border-vermilion py-2.5 text-sm text-basalt focus:outline-none aria-[invalid=true]:border-vermilion"
      />
      {hint && <p className="mt-1 font-mono text-[10px] tracking-[0.1em] text-ash">{hint}</p>}
    </div>
  );
}