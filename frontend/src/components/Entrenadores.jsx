import { useState, useEffect } from "react";
import { UsersIcon, CheckIcon, DeactivateIcon, WalletIcon } from "./Icons";
import { fetchEntrenadores, crearEntrenador } from "../services/api";

export default function Entrenadores() {
  const [entrenadores, setEntrenadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [porcentaje, setPorcentaje] = useState(60);

  const cargarEntrenadores = async () => {
    try {
      setCargando(true);
      const data = await fetchEntrenadores();
      setEntrenadores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEntrenadores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearEntrenador({
        nombre,
        telefono,
        porcentaje: parseFloat(porcentaje),
        activo: true
      });
      setMostrarFormulario(false);
      setNombre("");
      setTelefono("");
      setPorcentaje(60);
      cargarEntrenadores();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="entrenadores-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2>Directorio de Entrenadores</h2>
        <button className="btn-primary" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          {mostrarFormulario ? "Cancelar" : "+ Nuevo Entrenador"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3>Registrar Entrenador</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Comisión (%)</label>
              <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} min="0" max="100" step="0.1" required />
            </div>
            <button type="submit" className="btn-primary btn-success">Guardar</button>
          </form>
        </div>
      )}

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Comisión</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>Cargando entrenadores...</td></tr>
            ) : entrenadores.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>No hay entrenadores registrados.</td></tr>
            ) : (
              entrenadores.map(ent => (
                <tr key={ent.id}>
                  <td style={{ fontWeight: 600 }}>{ent.nombre}</td>
                  <td>{ent.telefono || "N/A"}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                      {ent.porcentaje}%
                    </span>
                  </td>
                  <td>
                    {ent.activo ? (
                      <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                        Activo
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                        Inactivo
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
