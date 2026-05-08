"use client";

import { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  durationMs?: number;
}

export function ErrorToast({ message, onClose, durationMs = 5000 }: ErrorToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, durationMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [durationMs, message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="error-toast" role="alert" aria-live="assertive">
      <p>{message}</p>
      <button type="button" className="button ghost" onClick={onClose}>
        Dismiss
      </button>
    </div>
  );
}
