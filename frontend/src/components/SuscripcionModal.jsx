import { useState } from "react";
import "./SuscripcionModal.css";

export default function SuscripcionModal({ usuario, planes, onClose, onSubmit }) {
  const [planId, setPlanId] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!planId) return;
    
    onSubmit({
      usuario_id: usuario.id,
      plan_id: planId
    });
  }

  // Prevenir que el click en el contenido del modal cierre el modal
  function handleContentClick(e) {
    e.stopPropagation();
  }

  return (
    <div className="modal-overlay" onClick={onClose} id="suscripcion-modal">
      <div className="modal-content glass-panel" onClick={handleContentClick}>
        <div className="modal-header">
          <h2>💰 Vender Plan</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-subtitle">
            Asignar plan a: <strong>{usuario.nombre_completo}</strong>
          </p>

          <form onSubmit={handleSubmit} id="form-vender-plan">
            <div className="form-group">
              <label htmlFor="select-plan">Seleccione el Plan</label>
              <select
                id="select-plan"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                required
              >
                <option value="">-- Elija un plan --</option>
                {planes.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nombre} - ${plan.precio.toLocaleString("es-CO")} ({plan.duracion_dias} días)
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary btn-success" disabled={!planId}>
                Confirmar Venta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
