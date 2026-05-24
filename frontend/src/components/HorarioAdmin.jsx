import { useState, useEffect } from "react";
import { UsersIcon, TrashIcon } from "./Icons";
import "./UsuarioTable.css";

export default function HorarioAdmin() {
  const [horarios, setHorarios] = useState([]);
  const [clases, setClases] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    clase_id: "",
    entrenador_id: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    es_recurrente: false
  });

  const [semanaOffset, setSemanaOffset] = useState(0);

  const API_BASE = "http://localhost:8000/api/v1";

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    cargarHorarios();
  }, [semanaOffset]);

  function getFechasSemana() {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + (semanaOffset * 7));
    
    // Obtener Lunes de la semana seleccionada
    const dia = hoy.getDay();
    const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
    const lunes = new Date(hoy.setDate(diff));
    lunes.setHours(0,0,0,0);
    
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    domingo.setHours(23,59,59,999);
    
    return {
      inicio: lunes.toISOString(),
      fin: domingo.toISOString(),
      lunesStr: lunes.toLocaleDateString(),
      domingoStr: domingo.toLocaleDateString()
    };
  }

  async function cargarCatalogos() {
    try {
      const [resClases, resEntrenadores] = await Promise.all([
        fetch(`${API_BASE}/clases/`),
        fetch(`${API_BASE}/entrenadores/`)
      ]);
      const dataClases = await resClases.json();
      const dataEntrenadores = await resEntrenadores.json();
      setClases(dataClases.filter(c => c.activa));
      setEntrenadores(dataEntrenadores);
    } catch (err) {
      console.error(err);
    }
  }

  async function cargarHorarios() {
    setCargando(true);
    const { inicio, fin } = getFechasSemana();
    try {
      const res = await fetch(`${API_BASE}/horarios/?inicio=${inicio}&fin=${fin}`);
      if (!res.ok) throw new Error("Error al cargar horarios");
      const data = await res.json();
      setHorarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { fecha, hora_inicio, hora_fin, ...rest } = form;
      const fecha_hora = new Date(`${fecha}T${hora_inicio}:00Z`).toISOString(); // Z or local offset? We should send ISO.
      // Better way:
      const localDate = new Date(`${fecha}T${hora_inicio}:00`);
      
      const res = await fetch(`${API_BASE}/horarios/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...rest,
          fecha_hora: localDate.toISOString(),
          hora_inicio: hora_inicio + ":00",
          hora_fin: hora_fin + ":00"
        })
      });
      
      if (!res.ok) throw new Error("Error al programar clase");
      
      await cargarHorarios();
      setMostrarForm(false);
    } catch (err) {
      alert(err.message);
    }
  }

  async function cancelarClase(id) {
    if (!confirm("¿ESTÁS SEGURO? Esto cancelará todas las reservas de los socios y enviará notificaciones por WhatsApp. Esta acción NO se puede deshacer.")) return;
    try {
      const res = await fetch(`${API_BASE}/horarios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al cancelar la clase");
      alert("Clase cancelada exitosamente.");
      cargarHorarios();
    } catch(err) {
      alert(err.message);
    }
  }

  async function proyectarSemana() {
    if (!confirm("Esto clonará todas las clases recurrentes para la próxima semana. ¿Continuar?")) return;
    try {
      const res = await fetch(`${API_BASE}/horarios/proyectar`, { method: "PUT" });
      const data = await res.json();
      alert(data.mensaje);
      cargarHorarios();
    } catch(err) {
      alert("Error al proyectar semana");
    }
  }

  const fechas = getFechasSemana();

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", color: "#1e293b", margin: "0 0 0.5rem" }}>Horario de Clases</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Programa las sesiones y asigna entrenadores.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-secondary" onClick={proyectarSemana} style={{ backgroundColor: "#f8fafc", color: "#3b82f6", border: "1px solid #cbd5e1" }}>
             Proyectar Semana
          </button>
          <button className="btn-primary" onClick={() => setMostrarForm(true)}>+ Programar Sesión</button>
        </div>
      </div>

      {mostrarForm && (
        <div className="glass-panel animate-scale-up" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", color: "#1e293b" }}>Programar Nueva Sesión</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Tipo de Clase</label>
                <select required className="form-select" value={form.clase_id} onChange={e => setForm({...form, clase_id: e.target.value})}>
                  <option value="">-- Seleccionar Clase --</option>
                  {clases.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Entrenador</label>
                <select required className="form-select" value={form.entrenador_id} onChange={e => setForm({...form, entrenador_id: e.target.value})}>
                  <option value="">-- Seleccionar Entrenador --</option>
                  {entrenadores.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Fecha</label>
                <input required type="date" className="form-input" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Hora Inicio</label>
                  <input required type="time" className="form-input" value={form.hora_inicio} onChange={e => setForm({...form, hora_inicio: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Hora Fin</label>
                  <input required type="time" className="form-input" value={form.hora_fin} onChange={e => setForm({...form, hora_fin: e.target.value})} />
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" id="recurrente" checked={form.es_recurrente} onChange={e => setForm({...form, es_recurrente: e.target.checked})} />
              <label htmlFor="recurrente" style={{ fontWeight: 600, color: "#475569" }}>Repetir esta clase cada semana (Recurrente)</label>
            </div>
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button type="button" className="btn-secondary" onClick={() => setMostrarForm(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Programar Clase</button>
            </div>
          </form>
        </div>
      )}

      {/* Control de Semanas */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: "1rem", borderRadius: "12px", marginBottom: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
         <button className="btn-secondary" onClick={() => setSemanaOffset(s => s - 1)}>← Semana Anterior</button>
         <h4 style={{ margin: 0, color: "#334155" }}>{fechas.lunesStr} - {fechas.domingoStr}</h4>
         <button className="btn-secondary" onClick={() => setSemanaOffset(s => s + 1)}>Siguiente Semana →</button>
      </div>

      <div className="table-container glass-panel">
        {cargando ? (
           <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Cargando agenda...</div>
        ) : horarios.length === 0 ? (
           <div style={{ padding: "3rem", textAlign: "center" }}>
             <p style={{ color: "#64748b", fontSize: "1.1rem" }}>No hay clases programadas en esta semana.</p>
           </div>
        ) : (
          <table id="horarios-table">
            <thead>
              <tr>
                <th>Día y Fecha</th>
                <th>Clase</th>
                <th>Horario</th>
                <th>Entrenador</th>
                <th>Cupos / Reservas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((h) => {
                const fechaObj = new Date(h.fecha_hora);
                const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
                const diaNombre = dias[fechaObj.getDay()];
                const porcentaje = (h.total_reservas / h.clase.cupo_maximo) * 100;
                
                return (
                <tr key={h.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{diaNombre}</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{fechaObj.toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 8px", backgroundColor: `${h.clase.color_hex}15`, borderRadius: "6px", color: h.clase.color_hex, fontWeight: 600 }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: h.clase.color_hex }}></span>
                      {h.clase.nombre}
                    </div>
                  </td>
                  <td>
                     {h.hora_inicio.slice(0,5)} - {h.hora_fin.slice(0,5)}
                  </td>
                  <td style={{ color: "#475569" }}>{h.entrenador.nombre}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                       <UsersIcon size={16} color="#64748b" />
                       <span style={{ fontWeight: 600 }}>{h.total_reservas}</span>
                       <span style={{ color: "#94a3b8" }}>/ {h.clase.cupo_maximo}</span>
                    </div>
                    {/* Barra de progreso de cupos */}
                    <div style={{ width: "100px", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "4px", marginTop: "4px", overflow: "hidden" }}>
                       <div style={{ height: "100%", backgroundColor: porcentaje >= 100 ? "#ef4444" : porcentaje > 80 ? "#f59e0b" : "#10b981", width: `${Math.min(porcentaje, 100)}%` }}></div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${h.estado === 'activa' ? 'active' : h.estado === 'llena' ? 'badge-amber' : 'inactive'}`} style={{ textTransform: "capitalize" }}>
                      {h.estado}
                    </span>
                  </td>
                  <td className="td-actions">
                    {h.estado !== 'cancelada' && (
                      <button className="btn-icon btn-deactivate" onClick={() => cancelarClase(h.id)} title="Cancelar Sesión">
                        <TrashIcon size={16} color="#dc2626" />
                      </button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
