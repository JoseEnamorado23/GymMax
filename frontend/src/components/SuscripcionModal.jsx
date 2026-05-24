import { useState, useEffect } from "react";
import { WalletIcon, CloseIcon } from "./Icons";
import "./SuscripcionModal.css";

export default function SuscripcionModal({ usuario, planes, onClose, onSubmit }) {
  const [planId, setPlanId] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [monto, setMonto] = useState("");

  // Cada vez que cambia el plan seleccionado, autocompletamos el monto
  useEffect(() => {
    if (!planId) {
      setMonto("");
      return;
    }
    const planSeleccionado = planes.find(p => p.id === planId);
    if (planSeleccionado) {
      const precioDefault = planSeleccionado.precio_especial !== null && planSeleccionado.precio_especial !== undefined
        ? planSeleccionado.precio_especial
        : planSeleccionado.precio;
      setMonto(precioDefault);
    }
  }, [planId, planes]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!planId || !monto) return;
    
    onSubmit({
      usuario_id: usuario.id,
      plan_id: planId,
      metodo_pago: metodoPago,
      monto: parseFloat(monto)
    });
  }

  // Prevenir que el click en el contenido del modal cierre el modal
  function handleContentClick(e) {
    e.stopPropagation();
  }

  const planSeleccionado = planes.find(p => p.id === planId);

  return (
    <div className="modal-overlay" onClick={onClose} id="suscripcion-modal">
      <div className="modal-content glass-panel" onClick={handleContentClick}>
        <div className="modal-header">
          <h2>
            <span style={{ display: "inline-flex", alignItems: "center", marginRight: "6px" }}>
              <WalletIcon size={22} color="var(--primary-color)" />
            </span>
            Registrar Venta de Plan
          </h2>
          <button className="btn-close" onClick={onClose} style={{ display: "inline-flex", alignItems: "center" }}>
            <CloseIcon size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-subtitle">
            Cliente: <strong>{usuario.nombre_completo}</strong>
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
                {planes.map(plan => {
                  const tienePrecioEspecial = plan.precio_especial !== null && plan.precio_especial !== undefined;
                  const precioMostrar = tienePrecioEspecial ? plan.precio_especial : plan.precio;
                  return (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre} - ${precioMostrar.toLocaleString("es-CO")} {tienePrecioEspecial ? "(Promo)" : ""} ({plan.duracion_dias} días)
                    </option>
                  );
                })}
              </select>
            </div>

            {planSeleccionado && (
              <>
                <div className="form-group animate-slide-in">
                  <label htmlFor="select-metodo">Método de Pago</label>
                  <select
                    id="select-metodo"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    required
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Nequi">Nequi</option>
                  </select>
                </div>

                <div className="form-group animate-slide-in">
                  <label htmlFor="input-monto">Monto a Cobrar ($)</label>
                  <input
                    type="number"
                    id="input-monto"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    min="0"
                    step="any"
                    required
                    placeholder="Monto de la transacción"
                  />
                  {planSeleccionado.precio_especial !== null && (
                    <p className="help-text">
                      * El plan cuenta con un precio promocional de ${planSeleccionado.precio_especial.toLocaleString("es-CO")}.
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary btn-success" disabled={!planId || !monto}>
                Confirmar Venta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
