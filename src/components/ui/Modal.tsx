import type { ReactNode } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { cx } from '../../lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  maxWidth?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, labelledBy, maxWidth = 'max-w-md', children }: Props) {
  const ref = useFocusTrap(open, onClose);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-basalt/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cx('bg-baryta border border-basalt w-full my-auto shadow-2xl', maxWidth)}
      >
        {children}
      </div>
    </div>
  );
}