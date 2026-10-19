import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface ToastCtx { toast: string | null; flash: (msg: string) => void; }
const Ctx = createContext<ToastCtx>({ toast: null, flash: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  return <Ctx.Provider value={{ toast, flash }}>{children}</Ctx.Provider>;
}

export const useToast = () => useContext(Ctx);