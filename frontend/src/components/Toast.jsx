import { CheckIcon, DeactivateIcon, ClockIcon, CloseIcon } from "./Icons";
import "./Toast.css";
import { useEffect } from "react";

export default function Toast({ mensaje, tipo = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${tipo}`} id="toast-notification">
      <span className="toast-icon" style={{ display: "inline-flex", alignItems: "center" }}>
        {tipo === "success" ? (
          <CheckIcon size={16} color="#10b981" />
        ) : tipo === "error" ? (
          <DeactivateIcon size={16} color="#ef4444" />
        ) : (
          <ClockIcon size={16} color="#3b82f6" />
        )}
      </span>
      <span className="toast-msg">{mensaje}</span>
      <button className="toast-close" onClick={onClose} style={{ display: "inline-flex", alignItems: "center" }}>
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
