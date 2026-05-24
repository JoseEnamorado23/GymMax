import { useState, useEffect } from "react";
import { CameraIcon, CheckIcon, DeactivateIcon, ClockIcon } from "./Icons";
import "./AsistenciaScanner.css";
import { marcarAsistencia, fetchAsistencias } from "../services/api";

export default function AsistenciaScanner({ usuarios, mostrarToast }) {
  const [selectedUsuarioId, setSelectedUsuarioId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  async function cargarHistorial() {
    try {
      const data = await fetchAsistencias();
      setHistorial(data);
    } catch (err) {
      console.error("Error al cargar historial de asistencias:", err);
    } finally {
      setCargandoHistorial(false);
    }
  }

  useEffect(() => {
    cargarHistorial();
  }, []);

  async function handleScan(e) {
    e.preventDefault();
    if (!selectedUsuarioId) return;

    setScanning(true);
    setLastResult(null);

    try {
      // Simulamos un pequeño retraso de lectura del QR
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const res = await marcarAsistencia({ usuario_id: selectedUsuarioId });
      
      // Acceso permitido
      setLastResult({
        success: true,
        mensaje: res.mensaje,
        usuario: usuarios.find(u => u.id === selectedUsuarioId)?.nombre_completo
      });
      mostrarToast("Asistencia registrada", "success");
      
      // Recargamos el historial en tiempo real
      cargarHistorial();
      
    } catch (err) {
      // Acceso denegado
      setLastResult({
        success: false,
        mensaje: err.message,
        usuario: usuarios.find(u => u.id === selectedUsuarioId)?.nombre_completo
      });
      mostrarToast("Acceso denegado", "error");
    } finally {
      setScanning(false);
      setSelectedUsuarioId("");
    }
  }

  return (
    <div className="recepcion-layout" id="recepcion-layout">
      {/* Columna Izquierda: Escáner QR */}
      <div className="scanner-container glass-panel" id="asistencia-scanner">
        <div className="scanner-header">
          <h2>
            <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: "8px" }}>
              <CameraIcon size={24} color="var(--accent-hover)" />
            </span>
            Simulador de Escáner QR
          </h2>
          <p>En la vida real esto sería automático con la cámara, aquí seleccionamos al usuario.</p>
        </div>

        <div className="scanner-body">
          <form onSubmit={handleScan} className="scanner-form">
            <div className="form-group">
              <label htmlFor="qr-usuario">Simular lectura de QR para el usuario:</label>
              <select
                id="qr-usuario"
                value={selectedUsuarioId}
                onChange={(e) => setSelectedUsuarioId(e.target.value)}
                disabled={scanning}
              >
                <option value="">-- Seleccione un usuario a escanear --</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.documento_identidad} - {u.nombre_completo}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              className={`btn-primary btn-scan ${scanning ? 'scanning' : ''}`}
              disabled={!selectedUsuarioId || scanning}
              id="btn-scan"
            >
              {scanning ? "Escaneando..." : "Escanear QR"}
            </button>
          </form>

          {lastResult && (
            <div className={`scan-result ${lastResult.success ? 'result-success' : 'result-error'}`}>
              <div className="result-icon" style={{ display: "inline-flex", alignItems: "center" }}>
                {lastResult.success ? (
                  <CheckIcon size={48} color="#047857" />
                ) : (
                  <DeactivateIcon size={48} color="#b91c1c" />
                )}
              </div>
              <div className="result-info">
                <h3>{lastResult.success ? "ACCESO PERMITIDO" : "ACCESO DENEGADO"}</h3>
                <p className="result-user">{lastResult.usuario}</p>
                <p className="result-message">{lastResult.mensaje}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Historial de Accesos Recientes */}
      <div className="historial-container glass-panel" id="historial-asistencias">
        <div className="historial-header">
          <h2>
            <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: "8px" }}>
              <ClockIcon size={24} color="#3b82f6" />
            </span>
            Historial de Accesos Recientes
          </h2>
          <p>Control de ingresos en tiempo real con fecha y hora.</p>
        </div>

        <div className="historial-body">
          {cargandoHistorial ? (
            <div className="cargando-spinner">Cargando historial...</div>
          ) : historial.length === 0 ? (
            <p className="no-data">No se han registrado ingresos aún hoy.</p>
          ) : (
            <div className="historial-list">
              {historial.map((asist) => {
                const fecha = new Date(asist.fecha_hora);
                const horaStr = fecha.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                const fechaStr = fecha.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                return (
                  <div className="historial-card entry-animate" key={asist.id}>
                    <div className="historial-card-avatar">
                      {asist.usuario?.foto_perfil ? (
                        <img src={asist.usuario.foto_perfil} alt={asist.usuario.nombre_completo} className="avatar-img" />
                      ) : (
                        <div className="avatar-placeholder">
                          {asist.usuario?.nombre_completo?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="historial-card-info">
                      <h4 className="historial-card-name">
                        {asist.usuario?.nombre_completo || "Usuario Desconocido"}
                      </h4>
                      <p className="historial-card-doc">
                        Doc: {asist.usuario?.documento_identidad || "N/A"}
                      </p>
                    </div>
                    <div className="historial-card-time">
                      <span className="time-badge">{horaStr}</span>
                      <span className="date-badge">{fechaStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

