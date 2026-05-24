import "./PlanTable.css";

export default function PlanTable({ planes, cargando, onToggleActivo }) {
  if (cargando) {
    return (
      <div className="table-container glass-panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando planes...</p>
        </div>
      </div>
    );
  }

  if (planes.length === 0) {
    return (
      <div className="table-container glass-panel">
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>Sin planes creados</h3>
          <p>Usa el formulario de arriba para crear tu primer plan.</p>
        </div>
      </div>
    );
  }

  function formatPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  }

  function formatDuracion(dias) {
    if (dias === 1) return "1 día";
    if (dias === 30) return "1 mes";
    if (dias === 60) return "2 meses";
    if (dias === 90) return "3 meses";
    if (dias === 365) return "1 año";
    return `${dias} días`;
  }

  return (
    <div className="plan-table-container glass-panel" id="planes-table-container">
      <div className="table-header">
        <h2>
          Planes Disponibles
          <span className="badge badge-amber">{planes.length}</span>
        </h2>
      </div>

      <div className="plan-cards">
        {planes.map((plan, i) => (
          <div
            key={plan.id}
            className="plan-card"
            style={{ animationDelay: `${i * 0.08}s` }}
            id={`plan-card-${plan.id}`}
          >
            <div className="plan-card-header">
              <span className="plan-icon">🏷️</span>
              <h3 className="plan-nombre">{plan.nombre}</h3>
            </div>

            {plan.descripcion && (
              <p className="plan-descripcion">{plan.descripcion}</p>
            )}

            <div className="plan-details">
              <div className="plan-detail">
                <span className="detail-label">Precio</span>
                {plan.precio_especial ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ textDecoration: "line-through", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {formatPrecio(plan.precio)}
                    </span>
                    <span className="detail-value detail-precio" style={{ color: "var(--primary-color)" }}>
                      {formatPrecio(plan.precio_especial)}
                    </span>
                  </div>
                ) : (
                  <span className="detail-value detail-precio">{formatPrecio(plan.precio)}</span>
                )}
              </div>
              <div className="plan-detail">
                <span className="detail-label">Duración</span>
                <span className="detail-value detail-duracion">{formatDuracion(plan.duracion_dias)}</span>
              </div>
            </div>

            <div className="plan-status" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className={`status-badge ${plan.activo ? "active" : "inactive"}`}>
                {plan.activo ? "Activo" : "Inactivo"}
              </span>
              <button 
                className="btn-icon" 
                onClick={() => onToggleActivo(plan.id)}
                title={plan.activo ? "Desactivar Plan" : "Activar Plan"}
                style={{ background: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
              >
                {plan.activo ? "🚫" : "✅"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
