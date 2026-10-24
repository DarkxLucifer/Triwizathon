"use client";

import React, { useEffect } from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type?: "success" | "info" | "warning";
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === "success";
  const isWarning = toast.type === "warning";

  let icon = <Info className="w-3.5 h-3.5 text-slate-300 shrink-0" />;

  if (isSuccess) {
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#bef226] shrink-0" />;
  } else if (isWarning) {
    icon = <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
  }

  return (
    <div
      className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white shadow-2xl backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in duration-150"
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-xs font-semibold leading-snug">
          {toast.message}
        </span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-colors p-0.5 ml-2 cursor-pointer"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
