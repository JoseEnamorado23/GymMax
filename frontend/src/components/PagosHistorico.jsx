import { useState } from "react";
import { WalletIcon, CashIcon, MobileIcon, SearchIcon, ClipboardIcon } from "./Icons";
import "./PagosHistorico.css";

export default function PagosHistorico({ pagos, cargando }) {
  const [buscar, setBuscar] = useState("");
  const [metodoFiltro, setMetodoFiltro] = useState("Todos");

  // Cálculos financieros para KPI Cards
  const totalIngresos = pagos.reduce((sum, p) => sum + p.monto, 0);
  const ingresosEfectivo = pagos.filter(p => p.metodo_pago === "Efectivo").reduce((sum, p) => sum + p.monto, 0);
  const ingresosNequi = pagos.filter(p => p.metodo_pago === "Nequi").reduce((sum, p) => sum + p.monto, 0);

  // Filtrado de la lista de pagos
  const pagosFiltrados = pagos.filter(p => {
    const cumpleBuscar = p.usuario?.nombre_completo.toLowerCase().includes(buscar.toLowerCase()) || 
                          p.usuario?.documento_identidad.includes(buscar);
    const cumpleMetodo = metodoFiltro === "Todos" || p.metodo_pago === metodoFiltro;
    return cumpleBuscar && cumpleMetodo;
  });

  return (
    <div className="finanzas-container" id="finanzas-container">
      {/* --- Resumen Financiero (KPIs) --- */}
      <div className="finanzas-kpis">
        <div className="kpi-card total-kpi">
          <div className="kpi-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <WalletIcon size={28} color="var(--accent-hover)" />
          </div>
          <div className="kpi-details">
            <h3>Ingresos Totales</h3>
            <p className="kpi-val">${totalIngresos.toLocaleString("es-CO")}</p>
            <span className="kpi-subtitle">Ventas consolidadas</span>
          </div>
        </div>

        <div className="kpi-card efectivo-kpi">
          <div className="kpi-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <CashIcon size={28} color="#10b981" />
          </div>
          <div className="kpi-details">
            <h3>Efectivo</h3>
            <p className="kpi-val">${ingresosEfectivo.toLocaleString("es-CO")}</p>
            <span className="kpi-subtitle">Caja física</span>
          </div>
        </div>

        <div className="kpi-card nequi-kpi">
          <div className="kpi-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <MobileIcon size={28} color="#da0077" />
          </div>
          <div className="kpi-details">
            <h3>Nequi</h3>
            <p className="kpi-val">${ingresosNequi.toLocaleString("es-CO")}</p>
            <span className="kpi-subtitle">Transacciones digitales</span>
          </div>
        </div>
      </div>

      {/* --- Controles de Filtros --- */}
      <div className="finanzas-header-actions glass-panel">
        <div className="search-box">
          <span className="search-icon" style={{ display: "inline-flex", alignItems: "center" }}>
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por cliente o documento..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <label htmlFor="filtro-metodo">Método:</label>
          <select
            id="filtro-metodo"
            value={metodoFiltro}
            onChange={(e) => setMetodoFiltro(e.target.value)}
          >
            <option value="Todos">Todos los métodos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Nequi">Nequi</option>
          </select>
        </div>
      </div>

      {/* --- Tabla de Historial --- */}
      <div className="table-container glass-panel">
        {cargando ? (
          <div className="cargando-tabla">Cargando transacciones financieras...</div>
        ) : pagosFiltrados.length === 0 ? (
          <div className="no-data-tabla">
            <span className="no-data-icon" style={{ display: "inline-flex", justifyContent: "center", width: "100%", marginBottom: "1rem" }}>
              <ClipboardIcon size={48} />
            </span>
            <p>No se encontraron registros de pagos con los filtros actuales.</p>
          </div>
        ) : (
          <table className="tabla-pagos" id="tabla-pagos-list">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Duración</th>
                <th>Método</th>
                <th className="text-right">Monto Cobrado</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => {
                const fecha = new Date(pago.fecha_pago);
                const fechaStr = fecha.toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={pago.id} className="row-animate">
                    <td className="date-cell">{fechaStr}</td>
                    <td>
                      <div className="cliente-info">
                        <span className="cliente-name">{pago.usuario?.nombre_completo || "Usuario Desconocido"}</span>
                        <span className="cliente-doc">Doc: {pago.usuario?.documento_identidad}</span>
                      </div>
                    </td>
                    <td>
                      <span className="plan-badge">{pago.plan?.nombre || "N/A"}</span>
                    </td>
                    <td className="duration-cell">{pago.plan?.duracion_dias || 0} días</td>
                    <td>
                      <span className={`metodo-badge ${pago.metodo_pago === "Nequi" ? "badge-nequi" : "badge-efectivo"}`}>
                        {pago.metodo_pago === "Nequi" ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <MobileIcon size={12} color="#9d174d" /> Nequi
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <CashIcon size={12} color="#065f46" /> Efectivo
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="text-right amount-cell">
                      ${pago.monto.toLocaleString("es-CO")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
