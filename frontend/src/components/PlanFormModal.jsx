import { ClipboardIcon, CloseIcon } from "./Icons";
import PlanForm from "./PlanForm";
import "./PlanFormModal.css";

export default function PlanFormModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleOverlayClick} id="plan-modal-overlay">
      <div className="modal-content form-modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>
            <span style={{ display: "inline-flex", alignItems: "center", marginRight: "6px" }}>
              <ClipboardIcon size={22} color="var(--primary-color)" />
            </span>
            Crear Nuevo Plan
          </h2>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar formulario" style={{ display: "inline-flex", alignItems: "center" }}>
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="modal-body form-modal-body">
          <PlanForm
            onSubmit={onSubmit}
            editando={null}
            onCancelar={onClose}
          />
        </div>

      </div>
    </div>
  );
}
