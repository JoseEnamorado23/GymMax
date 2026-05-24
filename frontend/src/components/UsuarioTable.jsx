import { UsersIcon, CartIcon, EditIcon, DeactivateIcon, WhatsAppIcon } from "./Icons";
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
          <span className="empty-icon">
            <UsersIcon size={48} />
          </span>
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
                <td className="td-name">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {u.foto_perfil ? (
                      <img 
                        src={u.foto_perfil} 
                        alt={u.nombre_completo} 
                        style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary-color)" }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(u.nombre_completo) + "&background=random"; }}
                      />
                    ) : (
                      <img 
                        src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(u.nombre_completo) + "&background=random"} 
                        alt={u.nombre_completo} 
                        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                      />
                    )}
                    {u.nombre_completo}
                  </div>
                </td>
                <td><code>{u.documento_identidad}</code></td>
                <td>
                  <div>{u.telefono}</div>
                  {u.contacto_whatsapp && (
                    <a 
                      href={`https://wa.me/${u.contacto_whatsapp.replace(/\D/g,'')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.8rem", color: "#25D366", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", marginRight: "4px" }}>
                        <WhatsAppIcon size={14} color="#25D366" />
                      </span>{" "}
                      WhatsApp
                    </a>
                  )}
                </td>
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
                  >
                    <CartIcon size={16} color="#10b981" />
                  </button>
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => onEditar(u)}
                    title="Editar"
                    id={`btn-edit-${u.id}`}
                  >
                    <EditIcon size={16} color="#2563eb" />
                  </button>
                  {u.activo && (
                    <button
                      className="btn-icon btn-deactivate"
                      onClick={() => onDesactivar(u.id)}
                      title="Desactivar"
                      id={`btn-deactivate-${u.id}`}
                    >
                      <DeactivateIcon size={16} color="#dc2626" />
                    </button>
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
