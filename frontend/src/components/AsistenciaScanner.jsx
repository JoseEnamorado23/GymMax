import { useState } from "react";
import "./AsistenciaScanner.css";
import { marcarAsistencia } from "../services/api";

export default function AsistenciaScanner({ usuarios, mostrarToast }) {
  const [selectedUsuarioId, setSelectedUsuarioId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

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
    <div className="scanner-container glass-panel" id="asistencia-scanner">
      <div className="scanner-header">
        <h2>📷 Simulador de Escáner QR</h2>
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
            <div className="result-icon">
              {lastResult.success ? "✅" : "⛔"}
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
  );
}
