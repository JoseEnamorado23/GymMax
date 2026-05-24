import { UsersIcon, CloseIcon } from "./Icons";
import UsuarioForm from "./UsuarioForm";
import "./UsuarioFormModal.css";

export default function UsuarioFormModal({ isOpen, onClose, onSubmit, editando }) {
  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleOverlayClick} id="usuario-modal-overlay">
      <div className="modal-content form-modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2>
            <span style={{ display: "inline-flex", alignItems: "center", marginRight: "6px" }}>
              <UsersIcon size={22} color="var(--primary-color)" />
            </span>
            {editando ? "Editar Usuario" : "Registrar Nuevo Usuario"}
          </h2>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar formulario" style={{ display: "inline-flex", alignItems: "center" }}>
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="modal-body form-modal-body">
          <UsuarioForm
            onSubmit={onSubmit}
            editando={editando}
            onCancelar={onClose}
          />
        </div>

      </div>
    </div>
  );
}
