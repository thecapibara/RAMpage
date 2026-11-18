import React, { useEffect, useRef } from 'react';
import Icons from './icons';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  // Escape closes; initial focus goes to the safe (Cancel) action and Tab /
  // Shift+Tab stay trapped inside the dialog instead of reaching the page behind it.
  useEffect(() => {
    if (!isOpen) return;
    const prevFocus = document.activeElement;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-0/85 p-4"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="glass rounded-2xl p-6 max-w-md w-full"
        style={{ borderColor: 'rgba(248,113,113,.5)', boxShadow: '0 0 60px -10px rgba(248,113,113,.4), 0 1px 0 rgba(255,255,255,.05) inset' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-line">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-soft"
            style={{ background: 'rgba(248,113,113,.15)', border: '1px solid rgba(248,113,113,.5)' }}
          >
            <Icons.ShieldAlert className="text-red" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-fox">{title}</h2>
            <p className="font-mono text-[.7rem] text-fox-3 mt-0.5">all processes will be terminated</p>
          </div>
        </div>
        <p className="text-sm text-fox-2 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 bg-white/[.03] border border-line text-fox-2 font-semibold py-2.5 rounded-lg text-xs hover:text-fox hover:border-line-strong transition-colors uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red/[0.12] text-red border border-red/40 hover:bg-red/[0.22] font-semibold py-2.5 rounded-lg text-xs transition-all uppercase tracking-wide"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}