import { CloseIcon, CheckIcon, DeactivateIcon } from "./Icons";
import "./ConfirmModal.css";

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  onConfirm, 
  onClose, 
  type = "danger" // 'danger' | 'success' | 'warning'
}) {
  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleOverlayClick} id="confirm-modal-overlay">
      <div className="modal-content confirm-modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header confirm-modal-header">
          <h2>
            <span className={`confirm-icon-wrapper ${type}`}>
              {type === "success" ? (
                <CheckIcon size={20} color="var(--success-color, #16a34a)" strokeWidth={2.5} />
              ) : (
                <DeactivateIcon size={20} color="var(--danger-color, #dc2626)" />
              )}
            </span>
            {title}
          </h2>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar modal">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body confirm-modal-body">
          <p className="confirm-message">{message}</p>
        </div>

        <div className="modal-actions confirm-modal-actions">
          <button type="button" className="btn-secondary confirm-btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`btn-primary confirm-btn-submit ${type}`} 
            onClick={onConfirm}
            id="confirm-modal-btn-action"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
