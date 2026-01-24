import React, { useEffect } from "react";
import "../styles/notice.css";

export default function Notice({ message, type = "success", duration = 4500, onClose }) {
  useEffect(() => {
    if (!message) return;
    if (duration <= 0) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`notice notice-${type}`} role="status" aria-live="polite">
      <div className="notice-inner">
        <div className="notice-icon" aria-hidden>✅</div>
        <div className="notice-msg">{message}</div>
        <button className="notice-close" onClick={() => onClose && onClose()} aria-label="Close">✕</button>
      </div>
    </div>
  );
}
