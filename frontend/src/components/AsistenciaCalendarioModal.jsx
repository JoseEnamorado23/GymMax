import { CloseIcon } from "./Icons";
import AsistenciaCalendario from "./AsistenciaCalendario";

export default function AsistenciaCalendarioModal({ isOpen, onClose, usuarioId, usuarioNombre }) {
  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={handleOverlayClick} id="calendario-modal-overlay">
      <div className="modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "840px", width: "95%" }}>
        
        <div className="modal-header">
          <h2>Historial de Asistencias (Calendario)</h2>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar modal" style={{ display: "inline-flex", alignItems: "center" }}>
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "1.5rem 2rem 2rem" }}>
          <AsistenciaCalendario
            usuarioId={usuarioId}
            usuarioNombre={usuarioNombre}
          />
        </div>

      </div>
    </div>
  );
}
