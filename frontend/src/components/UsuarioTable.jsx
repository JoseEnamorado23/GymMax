import "./UsuarioTable.css";

export default function UsuarioTable({ usuarios, onEditar, onDesactivar, onVenderPlan, cargando }) {
  if (cargando) {
    return (
      <div className="table-container glass-panel">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="table-container glass-panel">
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <h3>Sin usuarios registrados</h3>
          <p>Usa el formulario de arriba para registrar tu primer usuario.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container glass-panel" id="usuarios-table-container">
      <div className="table-header">
        <h2>
          Usuarios Registrados
          <span className="badge">{usuarios.length}</span>
        </h2>
      </div>

      <div className="table-scroll">
        <table id="usuarios-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Plan</th>
              <th>Fecha Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, i) => (
              <tr key={u.id} className="table-row" style={{ animationDelay: `${i * 0.05}s` }}>
                <td className="td-name">{u.nombre_completo}</td>
                <td><code>{u.documento_identidad}</code></td>
                <td>{u.telefono}</td>
                <td>
                  {u.plan ? (
                    <span className="badge badge-amber" style={{fontSize: "0.75rem", padding: "0.2rem 0.6rem"}}>{u.plan.nombre}</span>
                  ) : (
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontStyle: "italic" }}>Sin plan</span>
                  )}
                </td>
                <td>{new Date(u.fecha_registro).toLocaleDateString("es-CO", {
                  year: "numeric", month: "short", day: "numeric"
                })}</td>
                <td>
                  <span className={`status-badge ${u.activo ? "active" : "inactive"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="td-actions">
                  <button
                    className="btn-icon btn-sell"
                    onClick={() => onVenderPlan(u)}
                    title="Vender Plan"
                    style={{ background: "rgba(16, 185, 129, 0.1)", borderColor: "#10b981" }}
                  >🛒</button>
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => onEditar(u)}
                    title="Editar"
                    id={`btn-edit-${u.id}`}
                  >✏️</button>
                  {u.activo && (
                    <button
                      className="btn-icon btn-deactivate"
                      onClick={() => onDesactivar(u.id)}
                      title="Desactivar"
                      id={`btn-deactivate-${u.id}`}
                    >🚫</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
