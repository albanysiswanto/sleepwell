import React from 'react';
import { LogOut } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-surface-container/60 backdrop-blur-[2px]">
      <div className="bg-surface border border-outline-variant rounded-xl w-full max-w-sm overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-[20px] font-bold text-on-surface mb-2">Keluar dari SleepWell?</h3>
          <p className="text-[15px] text-on-surface-variant leading-relaxed">
            Sesi Anda akan diakhiri dan Anda perlu masuk kembali untuk mengakses asisten AI dan riwayat data tidur Anda.
          </p>
        </div>
        <div className="p-4 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-md text-[14px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-md text-[14px] font-semibold bg-error hover:bg-error/90 text-on-error transition-colors flex items-center gap-2"
          >
            Keluar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
