import React from 'react';
import Icons from './icons';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md bg-[#0E0E10] border border-[#F87171]/50 rounded-xl p-6">
        <div className="flex items-center gap-3 border-b border-[#232327] pb-4 mb-4">
          <Icons.ShieldAlert className="text-[#F87171] w-7 h-7 animate-pulse" />
          <h2 className="text-base font-semibold text-[#ECECEC] uppercase tracking-wide">{title}</h2>
        </div>
        <p className="text-sm text-[#ECECEC] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-transparent border border-[#232327] text-[#8B8B92] font-semibold py-2.5 rounded-lg text-xs hover:border-[#3A3A42] hover:text-[#ECECEC] transition-colors uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40 hover:bg-[#F87171]/25 font-semibold py-2.5 rounded-lg text-xs transition-colors uppercase tracking-wide"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
