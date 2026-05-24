import { useState, useEffect } from "react";
import { UsersIcon, ClipboardIcon, PlusIcon, CloseIcon } from "./Icons";
import "./UsuarioTable.css";

export default function RutinasAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [rutinaActiva, setRutinaActiva] = useState(null);
  const [cargandoRutina, setCargandoRutina] = useState(false);
  const [progreso, setProgreso] = useState([]);
  
  // Formulario Rutina
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formRutina, setFormRutina] = useState({
    nombre: "",
    objetivo: "fuerza",
    fecha_inicio: new Date().toISOString().split('T')[0],
    semanas_duracion: 4,
    notas_entrenador: "",
    entrenador_id: "",
    dias: []
  });

  const API_BASE = "http://localhost:8000/api/v1";

  useEffect(() => {
    cargarCatalogos();
  }, []);

  async function cargarCatalogos() {
    setCargando(true);
    try {
      const [resUsr, resEntr, resEj] = await Promise.all([
        fetch(`${API_BASE}/usuarios/`),
        fetch(`${API_BASE}/entrenadores/`),
        fetch(`${API_BASE}/ejercicios/`)
      ]);
      setUsuarios(await resUsr.json());
      setEntrenadores(await resEntr.json());
      setEjercicios(await resEj.json());
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  async function seleccionarSocio(socio) {
    setSocioSeleccionado(socio);
    setMostrarForm(false);
    setCargandoRutina(true);
    try {
      const res = await fetch(`${API_BASE}/rutinas/${socio.id}`);
      if (res.ok) {
        const data = await res.json();
        setRutinaActiva(data);
        cargarProgreso(data.id);
      } else {
        setRutinaActiva(null);
        setProgreso([]);
      }
    } catch(err) {
      console.error(err);
      setRutinaActiva(null);
    } finally {
      setCargandoRutina(false);
    }
  }

  async function cargarProgreso(rutina_id) {
    try {
      const res = await fetch(`${API_BASE}/rutinas/${rutina_id}/progreso`);
      if (res.ok) {
        setProgreso(await res.json());
      }
    } catch(err) {
      console.error("Error cargando progreso");
    }
  }

  // --- Lógica del Creador de Rutinas ---
  function agregarDia() {
    const nuevoDia = {
      dia_numero: formRutina.dias.length + 1,
      nombre_dia: `Día ${formRutina.dias.length + 1}`,
      orden: formRutina.dias.length + 1,
      ejercicios: []
    };
    setFormRutina({...formRutina, dias: [...formRutina.dias, nuevoDia]});
  }

  function agregarEjercicio(diaIndex) {
    const nuevoEj = {
      ejercicio_id: ejercicios[0]?.id || "",
      orden: formRutina.dias[diaIndex].ejercicios.length + 1,
      series: 4,
      repeticiones: "10",
      peso_kg: 0,
      descanso_seg: 90,
      notas: ""
    };
    const nuevosDias = [...formRutina.dias];
    nuevosDias[diaIndex].ejercicios.push(nuevoEj);
    setFormRutina({...formRutina, dias: nuevosDias});
  }

  function actualizarEjercicio(diaIndex, ejIndex, campo, valor) {
    const nuevosDias = [...formRutina.dias];
    nuevosDias[diaIndex].ejercicios[ejIndex][campo] = valor;
    setFormRutina({...formRutina, dias: nuevosDias});
  }

  async function handleSubmitRutina(e) {
    e.preventDefault();
    if (!formRutina.entrenador_id) return alert("Seleccione un entrenador");
    
    try {
      const res = await fetch(`${API_BASE}/rutinas/${socioSeleccionado.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formRutina)
      });
      if (!res.ok) throw new Error("Error al asignar rutina");
      
      alert("Rutina asignada exitosamente");
      setMostrarForm(false);
      seleccionarSocio(socioSeleccionado); // Recargar
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", color: "#1e293b", margin: "0 0 0.5rem" }}>Entrenamiento Personalizado</h2>
          <p style={{ color: "#64748b", margin: 0 }}>Crea rutinas y haz seguimiento al progreso de los socios.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "2rem" }}>
        {/* Panel Lateral: Lista de Socios */}
        <div className="glass-panel" style={{ padding: "1.5rem", height: "fit-content", maxHeight: "80vh", overflowY: "auto" }}>
          <h3 style={{ marginTop: 0, color: "#1e293b", fontSize: "1.1rem", marginBottom: "1rem" }}>Seleccionar Socio</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {cargando ? <p>Cargando...</p> : usuarios.map(u => (
              <button 
                key={u.id}
                onClick={() => seleccionarSocio(u)}
                style={{ 
                  textAlign: "left", padding: "1rem", borderRadius: "12px", border: "none", cursor: "pointer",
                  backgroundColor: socioSeleccionado?.id === u.id ? "#eff6ff" : "transparent",
                  color: socioSeleccionado?.id === u.id ? "#2563eb" : "#475569",
                  fontWeight: socioSeleccionado?.id === u.id ? 700 : 500,
                  transition: "all 0.2s"
                }}
              >
                {u.nombre_completo}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Principal: Rutina del Socio */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          {!socioSeleccionado ? (
             <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#94a3b8" }}>
               <UsersIcon size={48} color="#cbd5e1" />
               <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>Selecciona un socio de la lista para ver o crear su rutina.</p>
             </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#1e293b" }}>{socioSeleccionado.nombre_completo}</h3>
                <button className="btn-primary" onClick={() => setMostrarForm(true)}>+ Crear Nueva Rutina</button>
              </div>

              {mostrarForm ? (
                <form onSubmit={handleSubmitRutina} className="animate-fade-in" style={{ backgroundColor: "#f8fafc", padding: "2rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                     <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#334155" }}>Configurar Rutina</h4>
                     <button type="button" onClick={() => setMostrarForm(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><CloseIcon /></button>
                   </div>
                   
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                     <div>
                       <label className="form-label">Entrenador Asignado</label>
                       <select className="form-select" value={formRutina.entrenador_id} onChange={e => setFormRutina({...formRutina, entrenador_id: e.target.value})} required>
                         <option value="">-- Seleccionar --</option>
                         {entrenadores.map(ent => <option key={ent.id} value={ent.id}>{ent.nombre}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="form-label">Nombre del Plan</label>
                       <input className="form-input" placeholder="Ej. Hipertrofia Fase 1" value={formRutina.nombre} onChange={e => setFormRutina({...formRutina, nombre: e.target.value})} required />
                     </div>
                     <div>
                       <label className="form-label">Objetivo</label>
                       <select className="form-select" value={formRutina.objetivo} onChange={e => setFormRutina({...formRutina, objetivo: e.target.value})}>
                         <option value="fuerza">Fuerza</option>
                         <option value="pérdida de peso">Pérdida de Peso</option>
                         <option value="ganancia muscular">Ganancia Muscular</option>
                       </select>
                     </div>
                     <div>
                       <label className="form-label">Duración (Semanas)</label>
                       <input type="number" min="1" className="form-input" value={formRutina.semanas_duracion} onChange={e => setFormRutina({...formRutina, semanas_duracion: parseInt(e.target.value)})} required />
                     </div>
                   </div>

                   {/* Días de Entrenamiento */}
                   <div style={{ marginBottom: "2rem" }}>
                     <h4 style={{ color: "#334155", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>Días de Entrenamiento</h4>
                     
                     {formRutina.dias.map((dia, diaIdx) => (
                       <div key={diaIdx} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #cbd5e1", marginTop: "1rem" }}>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                           <input 
                             className="form-input" 
                             style={{ width: "250px", fontWeight: "bold" }} 
                             value={dia.nombre_dia} 
                             onChange={e => {
                               const nd = [...formRutina.dias]; nd[diaIdx].nombre_dia = e.target.value; setFormRutina({...formRutina, dias: nd});
                             }} 
                           />
                           <button type="button" className="btn-secondary" onClick={() => agregarEjercicio(diaIdx)}>+ Añadir Ejercicio</button>
                         </div>

                         {/* Ejercicios del Día */}
                         {dia.ejercicios.map((ej, ejIdx) => (
                           <div key={ejIdx} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", backgroundColor: "#f1f5f9", padding: "1rem", borderRadius: "8px" }}>
                             <span style={{ fontWeight: 600, color: "#64748b" }}>{ejIdx + 1}.</span>
                             <select className="form-select" style={{ flex: 2 }} value={ej.ejercicio_id} onChange={e => actualizarEjercicio(diaIdx, ejIdx, "ejercicio_id", e.target.value)}>
                               <option value="">Selecciona Ejercicio...</option>
                               {ejercicios.map(ce => <option key={ce.id} value={ce.id}>{ce.nombre} ({ce.grupo_muscular})</option>)}
                             </select>
                             <input type="number" className="form-input" style={{ width: "80px" }} placeholder="Series" title="Series" value={ej.series} onChange={e => actualizarEjercicio(diaIdx, ejIdx, "series", parseInt(e.target.value))} />
                             <span style={{ color: "#94a3b8" }}>x</span>
                             <input type="text" className="form-input" style={{ width: "100px" }} placeholder="Reps" title="Repeticiones" value={ej.repeticiones} onChange={e => actualizarEjercicio(diaIdx, ejIdx, "repeticiones", e.target.value)} />
                             <input type="number" className="form-input" style={{ width: "100px" }} placeholder="Peso (Kg)" title="Peso sugerido (Kg)" value={ej.peso_kg} onChange={e => actualizarEjercicio(diaIdx, ejIdx, "peso_kg", parseFloat(e.target.value))} />
                             <input type="number" className="form-input" style={{ width: "100px" }} placeholder="Descanso" title="Descanso (segundos)" value={ej.descanso_seg} onChange={e => actualizarEjercicio(diaIdx, ejIdx, "descanso_seg", parseInt(e.target.value))} />
                           </div>
                         ))}
                       </div>
                     ))}
                     
                     <button type="button" className="btn-secondary" style={{ marginTop: "1rem", width: "100%", borderStyle: "dashed" }} onClick={agregarDia}>
                       + Añadir Día de Entrenamiento
                     </button>
                   </div>

                   <div style={{ display: "flex", justifyContent: "flex-end" }}>
                     <button type="submit" className="btn-primary">Guardar Rutina Activa</button>
                   </div>
                </form>
              ) : cargandoRutina ? (
                 <p>Cargando rutina actual...</p>
              ) : rutinaActiva ? (
                 <div className="animate-fade-in">
                   <div style={{ backgroundColor: "#eff6ff", padding: "1.5rem", borderRadius: "16px", marginBottom: "2rem", border: "1px solid #bfdbfe" }}>
                     <h4 style={{ margin: "0 0 0.5rem", color: "#1e40af", fontSize: "1.2rem" }}>{rutinaActiva.nombre}</h4>
                     <p style={{ margin: 0, color: "#1d4ed8" }}>Objetivo: <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{rutinaActiva.objetivo}</span> • {rutinaActiva.semanas_duracion} semanas</p>
                   </div>

                   <h4 style={{ color: "#334155", marginBottom: "1rem" }}>Estructura de la Rutina</h4>
                   <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                     {rutinaActiva.dias.sort((a,b)=>a.orden-b.orden).map(dia => (
                       <div key={dia.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                         <div style={{ backgroundColor: "#f8fafc", padding: "1rem", fontWeight: 600, color: "#334155", borderBottom: "1px solid #e2e8f0" }}>
                           {dia.nombre_dia}
                         </div>
                         <div style={{ padding: "1rem", backgroundColor: "white" }}>
                           {dia.ejercicios_rutina.map((ej, idx) => (
                             <div key={ej.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: idx !== dia.ejercicios_rutina.length -1 ? "1px solid #f1f5f9" : "none" }}>
                               <span style={{ fontWeight: 500, color: "#475569" }}>{ej.ejercicio.nombre}</span>
                               <span style={{ color: "#64748b" }}>{ej.series} series × {ej.repeticiones} reps — {ej.peso_kg || 0}kg — {ej.descanso_seg}s</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Sección Progreso Rápida */}
                   <h4 style={{ color: "#334155", marginBottom: "1rem" }}>Últimos Registros del Socio</h4>
                   {progreso.length === 0 ? (
                     <p style={{ color: "#94a3b8", fontStyle: "italic" }}>El socio aún no ha registrado entrenamientos para esta rutina.</p>
                   ) : (
                     <table id="usuarios-table">
                       <thead>
                         <tr>
                           <th>Fecha</th>
                           <th>Ejercicio</th>
                           <th>Series</th>
                           <th>Peso Real</th>
                           <th>Sensación (1-5)</th>
                         </tr>
                       </thead>
                       <tbody>
                         {progreso.slice(-5).reverse().map((p, idx) => (
                           <tr key={idx}>
                             <td>{new Date(p.fecha).toLocaleDateString()}</td>
                             <td style={{ fontWeight: 600 }}>{p.ejercicio}</td>
                             <td>{p.series} x {p.reps}</td>
                             <td>{p.peso} kg</td>
                             <td>
                               <div style={{ display: "flex", gap: "4px" }}>
                                 {[1,2,3,4,5].map(v => (
                                   <div key={v} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: v <= p.sensacion ? (p.sensacion >= 4 ? "#ef4444" : "#10b981") : "#e2e8f0" }}></div>
                                 ))}
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   )}

                 </div>
              ) : (
                 <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                   <p style={{ color: "#64748b", margin: "0 0 1rem" }}>Este socio no tiene ninguna rutina activa.</p>
                   <button className="btn-primary" onClick={() => setMostrarForm(true)}>Crear Primera Rutina</button>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
