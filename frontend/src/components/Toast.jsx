import "./Toast.css";
import { useEffect } from "react";

export default function Toast({ mensaje, tipo = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${tipo}`} id="toast-notification">
      <span className="toast-icon">
        {tipo === "success" ? "✅" : tipo === "error" ? "❌" : "ℹ️"}
      </span>
      <span className="toast-msg">{mensaje}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
