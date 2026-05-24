import { useState, useEffect } from "react";
import { DumbbellIcon, ClockIcon, CalendarIcon, UsersIcon } from "./Icons";

export default function SocioApp({ token }) {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  const [tabActual, setTabActual] = useState("inicio"); // inicio | clases | rutina
  
  const [horarios, setHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const [rutinaHoy, setRutinaHoy] = useState(null);
  const [cargandoRutina, setCargandoRutina] = useState(false);
  
  const [formsRegistro, setFormsRegistro] = useState({});

  // Usamos window.location.hostname para que funcione tanto en la PC (localhost) 
  // como en el celular (ej. 192.168.1.x)
  const API_BASE = `http://${window.location.hostname}:8000/api/v1`;

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const res = await fetch(`${API_BASE}/usuarios/token/${token}`);
        if (!res.ok) {
          throw new Error("Token inválido o expirado");
        }
        const data = await res.json();
        setPerfil(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    if (token) {
      cargarPerfil();
    }
  }, [token]);

  useEffect(() => {
    if (tabActual === "clases" && perfil) {
      cargarHorarios();
    }
    if (tabActual === "rutina" && perfil) {
      cargarRutinaHoy();
    }
  }, [tabActual, perfil]);

  async function cargarRutinaHoy() {
    setCargandoRutina(true);
    try {
      const res = await fetch(`${API_BASE}/rutinas/socio/rutina-hoy?usuario_id=${perfil.id}`);
      const data = await res.json();
      if (data.success && data.dia) {
        setRutinaHoy(data.dia);
        
        // Inicializar formularios para cada ejercicio
        const initialForms = {};
        data.dia.ejercicios_rutina.forEach(ej => {
          initialForms[ej.id] = {
            series_completadas: ej.series,
            reps_completadas: ej.repeticiones,
            peso_real_kg: ej.peso_kg || 0,
            sensacion: 3,
            nota_socio: "",
            completado: false
          };
        });
        setFormsRegistro(initialForms);
      } else {
        setRutinaHoy(null);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setCargandoRutina(false);
    }
  }

  async function registrarEjercicio(ej_rutina_id) {
    const formData = formsRegistro[ej_rutina_id];
    if (formData.completado) return; // ya completado en UI localmente
    
    try {
      const res = await fetch(`${API_BASE}/rutinas/socio/registrar-ejercicio?usuario_id=${perfil.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ejercicio_rutina_id: ej_rutina_id,
          series_completadas: formData.series_completadas,
          reps_completadas: formData.reps_completadas,
          peso_real_kg: formData.peso_real_kg,
          completado: true,
          sensacion: formData.sensacion,
          nota_socio: formData.nota_socio
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error");
      
      setFormsRegistro(prev => ({
        ...prev,
        [ej_rutina_id]: { ...prev[ej_rutina_id], completado: true }
      }));
    } catch(err) {
      alert(err.message);
    }
  }

  async function cargarHorarios() {
    setCargandoHorarios(true);
    try {
      const hoy = new Date();
      // Lunes
      const dia = hoy.getDay();
      const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
      const lunes = new Date(hoy.setDate(diff));
      lunes.setHours(0,0,0,0);
      const domingo = new Date(lunes);
      domingo.setDate(lunes.getDate() + 6);
      domingo.setHours(23,59,59,999);

      const res = await fetch(`${API_BASE}/horarios/?inicio=${lunes.toISOString()}&fin=${domingo.toISOString()}`);
      const data = await res.json();
      setHorarios(data);
    } catch(err) {
      console.error(err);
    } finally {
      setCargandoHorarios(false);
    }
  }

  async function reservarClase(horario_id) {
    try {
      const res = await fetch(`${API_BASE}/horarios/reservar?usuario_id=${perfil.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horario_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error al reservar");
      
      alert(data.mensaje);
      cargarHorarios(); // Refrescar cupos
    } catch (err) {
      alert(err.message);
    }
  }

  if (cargando) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
        <p style={{ color: "#64748b", fontWeight: 500 }}>Cargando tu perfil...</p>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc", padding: "2rem", textAlign: "center" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Acceso Denegado</h2>
        <p style={{ color: "#64748b" }}>{error || "No se pudo cargar el perfil."}</p>
        <p style={{ marginTop: "2rem", fontSize: "0.9rem", color: "#94a3b8" }}>Pide un nuevo link en recepción.</p>
      </div>
    );
  }

  const tieneSuscripcion = perfil.suscripcion_activa !== null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "1.5rem", paddingBottom: "5rem", maxWidth: "480px", margin: "0 auto", boxShadow: "0 0 20px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "2rem", paddingTop: "1rem" }}>
        <DumbbellIcon size={32} color="var(--primary-color)" />
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, background: "linear-gradient(90deg, #1e3a8a, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          GymMax
        </h1>
      </header>

      {tabActual === "inicio" && (
        <div className="animate-fade-in">
          {/* Perfil Info */}
          <div className="glass-panel" style={{ textAlign: "center", padding: "2rem 1.5rem", marginBottom: "1.5rem", borderRadius: "20px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#3b82f6", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold", margin: "0 auto 1rem", border: "4px solid #eff6ff" }}>
              {perfil.nombre_completo.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.3rem", color: "#1e293b" }}>{perfil.nombre_completo}</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>Doc: {perfil.documento_identidad}</p>
            
            <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Tu Código de Acceso</p>
              {/* Simulación de código QR con CSS */}
              <div style={{ width: "120px", height: "120px", background: "repeating-linear-gradient(45deg, #000 0, #000 10px, #fff 10px, #fff 20px)", margin: "0 auto", borderRadius: "8px", position: "relative" }}>
                 <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "0.5rem", fontWeight: "bold" }}>QR</div>
              </div>
            </div>
          </div>

          {/* Estado del Plan */}
          <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "20px", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "#1e293b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ClockIcon size={20} color="#3b82f6" />
              Estado de Membresía
            </h3>
            
            {tieneSuscripcion ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 600, color: "#3b82f6", fontSize: "1.1rem" }}>{perfil.suscripcion_activa.plan_nombre}</span>
                  <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>ACTIVO</span>
                </div>
                
                <div style={{ backgroundColor: "#f1f5f9", padding: "1rem", borderRadius: "12px", marginTop: "1rem" }}>
                  <p style={{ margin: "0 0 0.3rem", fontSize: "0.9rem", color: "#64748b" }}>Días restantes</p>
                  <p style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "#1e293b" }}>{perfil.dias_restantes} <span style={{ fontSize: "1rem", fontWeight: 500, color: "#64748b" }}>días</span></p>
                </div>
                <p style={{ margin: "1rem 0 0", fontSize: "0.85rem", color: "#94a3b8", textAlign: "center" }}>
                  Válido hasta: {new Date(perfil.suscripcion_activa.fecha_fin).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <p style={{ color: "#ef4444", fontWeight: 600, margin: "0 0 0.5rem" }}>No tienes un plan activo</p>
                <p style={{ fontSize: "0.9rem", color: "#64748b", margin: 0 }}>Acércate a recepción para renovar tu membresía.</p>
              </div>
            )}
          </div>

          {/* Instalar App Banner */}
          <div style={{ backgroundColor: "#1e293b", color: "white", padding: "1.5rem", borderRadius: "20px", textAlign: "center" }}>
            <h4 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>¿Quieres acceso rápido?</h4>
            <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#94a3b8" }}>Agrega esta página a tu pantalla de inicio para entrar más rápido la próxima vez.</p>
            <button style={{ backgroundColor: "#3b82f6", color: "white", border: "none", padding: "0.6rem 1.2rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", width: "100%" }}>
              Instalar App
            </button>
          </div>
        </div>
      )}

      {tabActual === "clases" && (
        <div className="animate-fade-in" style={{ paddingBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", color: "#1e293b", marginBottom: "1.5rem" }}>Clases de la Semana</h2>
          
          {cargandoHorarios ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Cargando calendario...</p>
          ) : horarios.length === 0 ? (
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", borderRadius: "20px" }}>
              <p style={{ color: "#64748b", margin: 0 }}>No hay clases programadas para esta semana.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {horarios.map(h => {
                const fecha = new Date(h.fecha_hora);
                const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
                const llena = h.cupos_disponibles === 0;
                
                return (
                  <div key={h.id} className="glass-panel" style={{ padding: "1.2rem", borderRadius: "16px", borderLeft: `6px solid ${h.clase.color_hex}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.1rem", color: "#1e293b" }}>{h.clase.nombre}</h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Con {h.entrenador.nombre}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "#3b82f6" }}>{dias[fecha.getDay()]} {fecha.getDate()}</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{h.hora_inicio.slice(0,5)}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: llena ? "#ef4444" : "#10b981", fontSize: "0.85rem", fontWeight: 600 }}>
                         <UsersIcon size={14} />
                         {llena ? "Lista de Espera" : `${h.cupos_disponibles} cupos libres`}
                      </div>
                      <button 
                        onClick={() => reservarClase(h.id)}
                        disabled={!tieneSuscripcion || h.estado === 'cancelada'}
                        style={{ 
                          backgroundColor: h.estado === 'cancelada' ? "#cbd5e1" : (llena ? "#f59e0b" : "#3b82f6"), 
                          color: "white", 
                          border: "none", 
                          padding: "0.5rem 1rem", 
                          borderRadius: "8px", 
                          fontWeight: 600, 
                          cursor: (!tieneSuscripcion || h.estado === 'cancelada') ? "not-allowed" : "pointer",
                          opacity: !tieneSuscripcion ? 0.5 : 1
                        }}
                      >
                        {h.estado === 'cancelada' ? "Cancelada" : (llena ? "Entrar a Espera" : "Reservar")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tabActual === "rutina" && (
        <div className="animate-fade-in" style={{ paddingBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", color: "#1e293b", marginBottom: "1.5rem" }}>Mi Rutina</h2>
          
          {cargandoRutina ? (
            <p style={{ textAlign: "center", color: "#64748b" }}>Cargando tu plan...</p>
          ) : !rutinaHoy ? (
            <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", borderRadius: "20px" }}>
              <p style={{ color: "#64748b", margin: 0 }}>No tienes una rutina asignada para hoy.</p>
            </div>
          ) : (
            <div>
              <div className="glass-panel" style={{ padding: "1.5rem", borderRadius: "20px", marginBottom: "1.5rem", backgroundColor: "#3b82f6", color: "white" }}>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem" }}>{rutinaHoy.nombre_dia}</h3>
                <p style={{ margin: 0, opacity: 0.9 }}>{rutinaHoy.ejercicios_rutina.length} ejercicios programados</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {rutinaHoy.ejercicios_rutina.sort((a,b)=>a.orden-b.orden).map((ej, idx) => {
                  const form = formsRegistro[ej.id] || {};
                  
                  return (
                    <div key={ej.id} className="glass-panel" style={{ padding: "1.2rem", borderRadius: "16px", border: form.completado ? "2px solid #10b981" : "1px solid #e2e8f0", transition: "all 0.3s" }}>
                      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ backgroundColor: form.completado ? "#10b981" : "#eff6ff", color: form.completado ? "white" : "#3b82f6", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 style={{ margin: "0 0 0.2rem", fontSize: "1.1rem", color: "#1e293b" }}>{ej.ejercicio.nombre}</h4>
                          <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", lineHeight: "1.4" }}>
                            {ej.series} series × {ej.repeticiones} reps — {ej.peso_kg || 0} kg — {ej.descanso_seg}s descanso
                          </p>
                        </div>
                      </div>

                      {!form.completado ? (
                        <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                          <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "0.85rem", color: "#475569" }}>Registrar Ejecución Real</p>
                          
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Peso Real (kg)</label>
                              <input type="number" className="form-input" value={form.peso_real_kg} onChange={e => setFormsRegistro({...formsRegistro, [ej.id]: {...form, peso_real_kg: parseFloat(e.target.value)}})} />
                            </div>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "#64748b" }}>Sensación (1 fácil - 5 fallo)</label>
                              <select className="form-select" value={form.sensacion} onChange={e => setFormsRegistro({...formsRegistro, [ej.id]: {...form, sensacion: parseInt(e.target.value)}})}>
                                <option value={1}>1 - Muy Fácil</option>
                                <option value={2}>2 - Fácil</option>
                                <option value={3}>3 - Adecuado</option>
                                <option value={4}>4 - Difícil</option>
                                <option value={5}>5 - Al Fallo</option>
                              </select>
                            </div>
                          </div>
                          
                          <button onClick={() => registrarEjercicio(ej.id)} style={{ width: "100%", padding: "0.8rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                             Marcar como Completado
                          </button>
                        </div>
                      ) : (
                        <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.8rem", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>
                           ✓ Ejercicio Completado ({form.peso_real_kg}kg, Sensación: {form.sensacion}/5)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "white", display: "flex", justifyContent: "space-around", padding: "0.8rem 0", boxShadow: "0 -4px 10px rgba(0,0,0,0.05)", zIndex: 10 }}>
        <button 
          onClick={() => setTabActual("inicio")}
          style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: tabActual === "inicio" ? "#3b82f6" : "#94a3b8", cursor: "pointer" }}
        >
          <UsersIcon size={24} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Perfil</span>
        </button>
        <button 
          onClick={() => setTabActual("clases")}
          style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: tabActual === "clases" ? "#3b82f6" : "#94a3b8", cursor: "pointer" }}
        >
          <CalendarIcon size={24} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Clases</span>
        </button>
        <button 
          onClick={() => setTabActual("rutina")}
          style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", color: tabActual === "rutina" ? "#3b82f6" : "#94a3b8", cursor: "pointer" }}
        >
          <DumbbellIcon size={24} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Rutina</span>
        </button>
      </nav>
    </div>
  );
}
