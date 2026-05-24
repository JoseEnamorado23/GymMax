import { useState, useEffect } from "react";
import { fetchSuscripcionUsuario } from "../services/api";
import AsistenciaCalendario from "./AsistenciaCalendario";
import { DumbbellIcon, WalletIcon, CalendarIcon, UsersIcon } from "./Icons";
import "./PortalCliente.css";

export default function PortalCliente({ usuarios, clienteSimuladoId, onCambiarCliente }) {
  const [suscripcion, setSuscripcion] = useState(null);
  const [cargandoSuscripcion, setCargandoSuscripcion] = useState(false);

  const selectedUser = Array.isArray(usuarios) 
    ? usuarios.find(u => u.id === clienteSimuladoId) 
    : null;

  useEffect(() => {
    async function loadSuscripcion() {
      if (!clienteSimuladoId) {
        setSuscripcion(null);
        return;
      }
      try {
        setCargandoSuscripcion(true);
        const data = await fetchSuscripcionUsuario(clienteSimuladoId);
        setSuscripcion(data);
      } catch (err) {
        console.error("Error al cargar suscripción del cliente:", err);
        setSuscripcion(null);
      } finally {
        setCargandoSuscripcion(false);
      }
    }
    loadSuscripcion();
  }, [clienteSimuladoId]);

  if (!clienteSimuladoId || !selectedUser) {
    return (
      <div className="portal-cliente-container glass-panel">
        <div className="portal-empty-state">
          <span className="portal-empty-icon">
            <UsersIcon size={48} color="var(--text-secondary)" />
          </span>
          <h3>Simulación de Portal de Cliente</h3>
          <p>Seleccione un cliente para ver su credencial digital, vigencia de plan y calendario de asistencias en tiempo real.</p>
          <div className="selector-simulado-box">
            <select
              value=""
              onChange={(e) => onCambiarCliente(e.target.value)}
              className="select-cliente-simulado"
            >
              <option value="" disabled>-- Seleccionar cliente a simular --</option>
              {Array.isArray(usuarios) && usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.nombre_completo} ({u.activo ? "Activo" : "Inactivo"})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Cálculos de vigencia
  const tienePlan = !!selectedUser.plan;
  const diasRestantes = (() => {
    if (!suscripcion || suscripcion.estado !== "Activa") return 0;
    const fin = new Date(suscripcion.fecha_fin);
    const hoy = new Date();
    const diffMs = fin.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  })();

  const isVencido = tienePlan && suscripcion && new Date(suscripcion.fecha_fin) < new Date();
  const estadoBadgeClass = !selectedUser.activo 
    ? "badge-cliente inactive" 
    : (tienePlan && suscripcion && suscripcion.estado === "Activa" && !isVencido) 
      ? "badge-cliente active" 
      : "badge-cliente inactive";

  const estadoBadgeText = !selectedUser.activo
    ? "Inactivo"
    : (tienePlan && suscripcion && suscripcion.estado === "Activa" && !isVencido)
      ? "Suscripción Activa"
      : "Sin Plan Activo";

  return (
    <div className="portal-cliente-container animate-fade-in">
      {/* Barra superior de simulación */}
      <div className="portal-sim-navbar glass-panel">
        <div className="sim-navbar-info">
          <span className="sim-indicator-dot"></span>
          <span>Modo Simulación: <strong>Portal del Cliente</strong></span>
        </div>
        <div className="sim-navbar-control">
          <label htmlFor="simular-otro-select">Ver como:</label>
          <select
            id="simular-otro-select"
            value={clienteSimuladoId}
            onChange={(e) => onCambiarCliente(e.target.value)}
            className="select-cliente-simulado-nav"
          >
            {Array.isArray(usuarios) && usuarios.map(u => (
              <option key={u.id} value={u.id}>
                {u.nombre_completo} ({u.activo ? "Activo" : "Inactivo"})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="portal-grid-layout">
        {/* Lado Izquierdo: Credencial Digital con QR */}
        <div className="portal-left-col">
          <div className="credencial-digital-card">
            <div className="credencial-header">
              <span className="credencial-brand">
                <DumbbellIcon size={18} color="var(--primary-color)" /> GYMMAX
              </span>
              <span className={estadoBadgeClass}>{estadoBadgeText}</span>
            </div>
            
            <div className="credencial-body">
              <div className="credencial-avatar-section">
                {selectedUser.foto_perfil ? (
                  <img 
                    src={selectedUser.foto_perfil} 
                    alt={selectedUser.nombre_completo} 
                    className="credencial-photo"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.nombre_completo)}&background=2563eb&color=fff&size=120`; 
                    }}
                  />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.nombre_completo)}&background=2563eb&color=fff&size=120`} 
                    alt={selectedUser.nombre_completo} 
                    className="credencial-photo"
                  />
                )}
              </div>

              <div className="credencial-info-section">
                <h3>{selectedUser.nombre_completo}</h3>
                <p className="credencial-doc">ID: <code>{selectedUser.documento_identidad}</code></p>
                <p className="credencial-tel">Tel: {selectedUser.telefono}</p>
              </div>

              {/* QR Mockup interactivo premium */}
              <div className="credencial-qr-section">
                <div className="qr-container-glowing">
                  <svg className="qr-svg" viewBox="0 0 100 100" width="120" height="120">
                    {/* Cuadros de esquina clásicos de QR */}
                    <rect x="5" y="5" width="25" height="25" fill="var(--text-primary)" rx="2" />
                    <rect x="10" y="10" width="15" height="15" fill="#ffffff" rx="1" />
                    <rect x="12" y="12" width="11" height="11" fill="var(--text-primary)" rx="0.5" />
                    
                    <rect x="70" y="5" width="25" height="25" fill="var(--text-primary)" rx="2" />
                    <rect x="75" y="10" width="15" height="15" fill="#ffffff" rx="1" />
                    <rect x="77" y="12" width="11" height="11" fill="var(--text-primary)" rx="0.5" />
                    
                    <rect x="5" y="70" width="25" height="25" fill="var(--text-primary)" rx="2" />
                    <rect x="10" y="75" width="15" height="15" fill="#ffffff" rx="1" />
                    <rect x="12" y="77" width="11" height="11" fill="var(--text-primary)" rx="0.5" />

                    {/* Relleno simulado de datos QR */}
                    <rect x="35" y="5" width="8" height="8" fill="var(--text-primary)" rx="1" />
                    <rect x="48" y="5" width="14" height="8" fill="var(--text-primary)" rx="1" />
                    
                    <rect x="35" y="18" width="20" height="8" fill="var(--text-primary)" rx="1" />
                    <rect x="60" y="18" width="5" height="15" fill="var(--text-primary)" rx="1" />

                    <rect x="5" y="35" width="8" height="20" fill="var(--text-primary)" rx="1" />
                    <rect x="18" y="35" width="12" height="8" fill="var(--text-primary)" rx="1" />
                    
                    <rect x="35" y="35" width="15" height="15" fill="var(--text-primary)" rx="1" />
                    <rect x="55" y="38" width="25" height="8" fill="var(--text-primary)" rx="1" />
                    <rect x="85" y="35" width="10" height="25" fill="var(--text-primary)" rx="1" />

                    <rect x="35" y="55" width="25" height="8" fill="var(--text-primary)" rx="1" />
                    <rect x="65" y="52" width="10" height="12" fill="var(--text-primary)" rx="1" />
                    
                    <rect x="35" y="70" width="8" height="25" fill="var(--text-primary)" rx="1" />
                    <rect x="48" y="75" width="15" height="8" fill="var(--text-primary)" rx="1" />
                    <rect x="48" y="87" width="47" height="8" fill="var(--text-primary)" rx="1" />
                    <rect x="68" y="70" width="27" height="10" fill="var(--text-primary)" rx="1" />
                  </svg>
                  <div className="qr-scanner-line"></div>
                </div>
                <p className="qr-caption">Presenta este QR para ingresar</p>
              </div>
            </div>

            <div className="credencial-footer">
              <span>Socio desde: {new Date(selectedUser.fecha_registro).toLocaleDateString("es-CO", { year: "numeric", month: "short" })}</span>
            </div>
          </div>

          {/* Tarjeta de Vigencia de Membresía */}
          <div className="membresia-vigencia-card glass-panel animate-slide-in">
            <h4 className="vigencia-title">
              <WalletIcon size={16} color="var(--primary-color)" /> Plan Contratado
            </h4>
            
            {cargandoSuscripcion ? (
              <div className="vigencia-cargando">
                <div className="spinner" style={{ width: "24px", height: "24px" }}></div>
                <p>Cargando membresía...</p>
              </div>
            ) : tienePlan && suscripcion ? (
              <div className="vigencia-details">
                <span className="vigencia-plan-name">{selectedUser.plan.nombre}</span>
                
                <div className="vigencia-stats-row">
                  <div className="vigencia-stat">
                    <span className="vigencia-stat-val">{diasRestantes}</span>
                    <span className="vigencia-stat-lbl">Días Restantes</span>
                  </div>
                  <div className="vigencia-stat">
                    <span className="vigencia-stat-val" style={{ color: diasRestantes > 5 ? "#10b981" : "#ef4444" }}>
                      {diasRestantes > 0 ? "Vigente" : "Vencido"}
                    </span>
                    <span className="vigencia-stat-lbl">Estado</span>
                  </div>
                </div>

                <div className="vigencia-dates">
                  <div className="date-item">
                    <span>Inicio:</span>
                    <strong>{new Date(suscripcion.fecha_inicio).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</strong>
                  </div>
                  <div className="date-item">
                    <span>Fin:</span>
                    <strong>{new Date(suscripcion.fecha_fin).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="vigencia-no-plan">
                <p>No tienes una membresía activa actualmente.</p>
                <p className="no-plan-tip">Contacta a la administración para adquirir un plan de entrenamiento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Calendario Completo */}
        <div className="portal-right-col">
          <div className="portal-calendario-box glass-panel">
            <AsistenciaCalendario 
              usuarioId={clienteSimuladoId}
              usuarioNombre={selectedUser.nombre_completo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
