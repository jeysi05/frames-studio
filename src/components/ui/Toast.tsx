import { useToast } from '../../hooks/useToast';

export function Toast() {
  const { toast } = useToast();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 lg:bottom-6 z-[150] flex justify-center px-4"
    >
      {toast && (
        <div className="bg-basalt text-baryta border border-baryta/20 px-5 py-3 font-mono text-[10px] tracking-[0.18em] uppercase text-center max-w-[92vw]">
          {toast}
        </div>
      )}
    </div>
  );
}