import { X } from 'lucide-react';
import { useEffect } from 'react';

export const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-surface rounded-xl shadow-xl border border-border my-8 animate-[fadeIn_0.15s_ease-out]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink rounded-lg p-1 hover:bg-paper transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
