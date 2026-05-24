import { useState, useEffect } from "react";
import { WalletIcon, CalendarIcon } from "./Icons";
import { fetchLiquidaciones } from "../services/api";

export default function Liquidaciones() {
  const dateObj = new Date();
  const [mes, setMes] = useState(dateObj.getMonth() + 1);
  const [anio, setAnio] = useState(dateObj.getFullYear());
  
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarLiquidaciones = async () => {
    try {
      setCargando(true);
      const data = await fetchLiquidaciones(mes, anio);
      setLiquidaciones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLiquidaciones();
  }, [mes, anio]);

  const totalGimnasio = liquidaciones.reduce((acc, curr) => acc + curr.monto_gym, 0);
  const totalEntrenadores = liquidaciones.reduce((acc, curr) => acc + curr.monto_entrenador, 0);

  const meses = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" }, { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" }, { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
  ];

  return (
    <div className="liquidaciones-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Liquidación de Comisiones</h2>
        
        <div className="filtros-fecha" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <CalendarIcon size={20} color="var(--text-secondary)" />
          <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))} className="form-select" style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input 
            type="number" 
            value={anio} 
            onChange={(e) => setAnio(parseInt(e.target.value))} 
            className="form-input" 
            style={{ width: '80px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
        </div>
      </div>

      <div className="table-container glass-panel" style={{ padding: '1.5rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Entrenador</th>
              <th>Clientes Atendidos</th>
              <th>Total Vendido ($)</th>
              <th>Porcentaje</th>
              <th style={{ color: '#166534' }}>A Pagar al Entrenador ($)</th>
              <th style={{ color: '#1e40af' }}>Beneficio Gym ($)</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>Calculando liquidaciones...</td></tr>
            ) : liquidaciones.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No se encontraron ventas asociadas a entrenadores este mes.</td></tr>
            ) : (
              liquidaciones.map(liq => (
                <tr key={liq.entrenador_id}>
                  <td style={{ fontWeight: 600 }}>{liq.entrenador_nombre}</td>
                  <td>{liq.num_clientes}</td>
                  <td>${liq.total_ventas.toLocaleString("es-CO")}</td>
                  <td>{liq.porcentaje}%</td>
                  <td style={{ fontWeight: 'bold', color: '#166534' }}>${liq.monto_entrenador.toLocaleString("es-CO")}</td>
                  <td style={{ fontWeight: 'bold', color: '#1e40af' }}>${liq.monto_gym.toLocaleString("es-CO")}</td>
                </tr>
              ))
            )}
          </tbody>
          {!cargando && liquidaciones.length > 0 && (
            <tfoot>
              <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid var(--border-color)' }}>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTALES DEL MES:</td>
                <td style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.1rem' }}>${totalEntrenadores.toLocaleString("es-CO")}</td>
                <td style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '1.1rem' }}>${totalGimnasio.toLocaleString("es-CO")}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button className="btn-secondary" onClick={() => window.print()}>
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>
    </div>
  );
}
