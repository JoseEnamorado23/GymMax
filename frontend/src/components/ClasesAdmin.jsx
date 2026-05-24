import { useState, useEffect } from "react";
import { EditIcon, DeactivateIcon, CheckIcon } from "./Icons";
import "./UsuarioTable.css"; // Reusing table styles

export default function ClasesAdmin() {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    duracion_min: 60,
    cupo_maximo: 20,
    color_hex: "#3b82f6"
  });

  const API_BASE = "http://localhost:8000/api/v1";

  useEffect(() => {
    cargarClases();
  }, []);

  async function cargarClases() {
    setCargando(true);
    try {
      const res = await fetch(`${API_BASE}/clases/`);
      if (!res.ok) throw new Error("Error al cargar clases");
      const data = await res.json();
      setClases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = editando ? `${API_BASE}/clases/${editando.id}` : `${API_BASE}/clases/`;
      const method = editando ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) throw new Error("Error al guardar clase");
      
      await cargarClases();
      cerrarForm();
    } catch (err) {
      alert(err.message);
    }
  }

  async function toggleActivo(clase) {
    if (!confirm(`¿Seguro que deseas ${clase.activa ? 'desactivar' : 'activar'} la clase ${clase.nombre}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/clases/${clase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !clase.activa })
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      cargarClases();
    } catch (err) {
      alert(err.message);
    }
  }

  function abrirForm(clase = null) {
    if (clase) {
      setEditando(clase);
      setForm({
        nombre: clase.nombre,
        descripcion: clase.descripcion || "",
        duracion_min: clase.duracion_min,
        cupo_maximo: clase.cupo_maximo,
        color_hex: clase.color_hex
      });
    } else {
      setEditando(null);
      setForm({ nombre: "", descripcion: "", duracion_min: 60, cupo_maximo: 20, color_hex: "#3b82f6" });
    }
    setMostrarForm(true);
  }

  function cerrarForm() {
    setMostrarForm(false);
    setEditando(null);
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", color: "#1e293b", margin: "0 0 0.5rem" }}>Catálogo de Clases</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Administra los tipos de clases grupales que ofrece el gimnasio.</p>
        </div>
        <button className="btn-primary" onClick={() => abrirForm()}>+ Nueva Clase</button>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px" }}>{error}</div>}

      {mostrarForm && (
        <div className="glass-panel animate-scale-up" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>
            {editando ? "Editar Clase" : "Crear Nueva Clase"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#475569" }}>Nombre de la clase</label>
                <input required type="text" className="form-input" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej: Yoga Avanzado" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#475569" }}>Duración (minutos)</label>
                <input required type="number" min="10" className="form-input" value={form.duracion_min} onChange={e => setForm({...form, duracion_min: parseInt(e.target.value)})} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#475569" }}>Cupo Máximo</label>
                <input required type="number" min="1" className="form-input" value={form.cupo_maximo} onChange={e => setForm({...form, cupo_maximo: parseInt(e.target.value)})} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#475569" }}>Color de Etiqueta</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input required type="color" value={form.color_hex} onChange={e => setForm({...form, color_hex: e.target.value})} style={{ width: "50px", height: "42px", padding: "0", border: "none", borderRadius: "8px", cursor: "pointer" }} />
                  <span style={{ fontSize: "0.9rem", color: "#64748b" }}>Selecciona un color para el calendario</span>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#475569" }}>Descripción (opcional)</label>
              <textarea className="form-input" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows="2" placeholder="Describe de qué trata la clase..."></textarea>
            </div>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn-secondary" onClick={cerrarForm}>Cancelar</button>
              <button type="submit" className="btn-primary">{editando ? "Guardar Cambios" : "Crear Clase"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container glass-panel">
        {cargando ? (
           <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Cargando clases...</div>
        ) : clases.length === 0 ? (
           <div style={{ padding: "3rem", textAlign: "center" }}>
             <p style={{ color: "#64748b", fontSize: "1.1rem" }}>No hay clases registradas aún.</p>
           </div>
        ) : (
          <table id="clases-table">
            <thead>
              <tr>
                <th>Color</th>
                <th>Nombre</th>
                <th>Duración</th>
                <th>Cupo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clases.map((clase) => (
                <tr key={clase.id} className={!clase.activa ? "inactive-row" : ""}>
                  <td>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: clase.color_hex, border: "2px solid rgba(0,0,0,0.1)" }}></div>
                  </td>
                  <td style={{ fontWeight: 600, color: "#1e293b" }}>
                    {clase.nombre}
                    {clase.descripcion && <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 400, marginTop: "4px" }}>{clase.descripcion}</div>}
                  </td>
                  <td>{clase.duracion_min} min</td>
                  <td>{clase.cupo_maximo} personas</td>
                  <td>
                    <span className={`status-badge ${clase.activa ? "active" : "inactive"}`}>
                      {clase.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button className="btn-icon btn-edit" onClick={() => abrirForm(clase)} title="Editar">
                      <EditIcon size={16} color="#2563eb" />
                    </button>
                    <button className={`btn-icon ${clase.activa ? "btn-deactivate" : "btn-activate"}`} onClick={() => toggleActivo(clase)} title={clase.activa ? "Desactivar" : "Activar"}>
                      {clase.activa ? <DeactivateIcon size={16} color="#dc2626" /> : <CheckIcon size={16} color="#16a34a" strokeWidth={2.5} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
