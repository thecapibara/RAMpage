import React from 'react';
import Icons from './icons';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-950 border-2 border-red-500 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.3)] p-6 font-mono">
        {/* Top bar with alert symbol */}
        <div className="flex items-center gap-3 border-b border-red-500/20 pb-4 mb-4">
          <Icons.ShieldAlert className="text-red-500 w-8 h-8 animate-pulse" />
          <h2 className="text-lg font-black text-white uppercase tracking-wider">{title}</h2>
        </div>
        
        {/* Message body */}
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>
        
        {/* Action buttons */}
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg text-xs border border-slate-700 transition-colors uppercase"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-xs border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all uppercase"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
