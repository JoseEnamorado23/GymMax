import { useState, useEffect } from "react";
import { fetchAsistencias } from "../services/api";
import { CalendarIcon, ClockIcon } from "./Icons";
import "./AsistenciaCalendario.css";

export default function AsistenciaCalendario({ usuarioId, usuarioNombre }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [asistencias, setAsistencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  // Cargar asistencias específicas del usuario
  useEffect(() => {
    async function loadAsistencias() {
      if (!usuarioId) return;
      try {
        setCargando(true);
        const data = await fetchAsistencias({ usuarioId });
        setAsistencias(data);
      } catch (err) {
        console.error("Error al cargar asistencias del usuario:", err);
      } finally {
        setCargando(false);
      }
    }
    loadAsistencias();
  }, [usuarioId]);

  // Navegación de meses
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDayDetail(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDayDetail(null);
  };

  // Obtener días del mes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Ajustar primer día para que empiece en lunes (es-ES estándar)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Agrupar asistencias por fecha (YYYY-MM-DD) para acceso rápido
  const asistenciasMap = {};
  asistencias.forEach(asist => {
    const dateObj = new Date(asist.fecha_hora);
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
    if (!asistenciasMap[dateStr]) {
      asistenciasMap[dateStr] = [];
    }
    asistenciasMap[dateStr].push(asist);
  });

  // Generar matriz de días para el grid del calendario
  const calendarDays = [];
  // Rellenar días del mes anterior
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push({ dayNumber: null, isCurrentMonth: false });
  }
  // Días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const asistenciasDia = asistenciasMap[dateStr] || [];
    calendarDays.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateString: dateStr,
      hasAttended: asistenciasDia.length > 0,
      entries: asistenciasDia
    });
  }

  // Cálculos de estadísticas para la IA de predicción de deserción (Streak y totales)
  const asistenciasMesActual = asistencias.filter(asist => {
    const d = new Date(asist.fecha_hora);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // Visitas totales en el mes
  const totalVisitasMes = asistenciasMesActual.length;

  // Calcular racha actual de asistencia consecutiva (entrenamientos seguidos)
  const getStreak = () => {
    if (asistencias.length === 0) return 0;
    
    // Extraer fechas únicas y ordenarlas descendentemente
    const uniqueDates = Array.from(new Set(asistencias.map(a => {
      const d = new Date(a.fecha_hora);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }))).sort((a, b) => b - a);

    const today = new Date();
    const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayMs = todayMs - 24 * 60 * 60 * 1000;

    // Si no ha venido ni hoy ni ayer, la racha actual se ha roto (es 0)
    if (uniqueDates[0] < yesterdayMs) {
      return 0;
    }

    let streak = 0;
    let expectedDateMs = uniqueDates[0]; // Empezamos desde la última fecha que asistió

    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === expectedDateMs) {
        streak++;
        expectedDateMs -= 24 * 60 * 60 * 1000; // Restamos 1 día para buscar el día anterior
      } else {
        break; // Racha terminada en esta brecha
      }
    }
    return streak;
  };

  const rachaEntrenamientos = getStreak();

  // Calcular tasa de consistencia (visitas sobre 30 días o sobre días transcurridos)
  const getConsistencia = () => {
    const today = new Date();
    let diasTotales = 30;
    if (today.getFullYear() === year && today.getMonth() === month) {
      diasTotales = today.getDate(); // Días transcurridos hoy
    }
    if (diasTotales === 0) return 0;
    const rate = Math.round((totalVisitasMes / diasTotales) * 100);
    return rate > 100 ? 100 : rate;
  };

  const consistenciaEntrenamiento = getConsistencia();

  // Estado de deserción predictiva (Ejemplo visual para módulo IA de Churn)
  const getEstadoDesercion = () => {
    if (cargando) return "Analizando...";
    if (asistencias.length === 0) return "Crítico 🚨 (Sin registros)";
    if (consistenciaEntrenamiento >= 50) return "Óptimo 🟢 (Bajo riesgo)";
    if (consistenciaEntrenamiento >= 25) return "Estable 🟡 (Riesgo bajo)";
    return "En Riesgo 🟠 (Riesgo alto de abandono)";
  };

  const estadoDesercionIA = getEstadoDesercion();

  const handleDayClick = (day) => {
    if (!day.dayNumber || !day.hasAttended) {
      setSelectedDayDetail(null);
      return;
    }
    setSelectedDayDetail(day);
  };

  return (
    <div className="calendario-modulo">
      <div className="calendario-header-bar">
        <h3>
          <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: "6px" }}>
            <CalendarIcon size={20} color="var(--primary-color)" />
          </span>
          Asistencias de: <strong>{usuarioNombre || "Usuario"}</strong>
        </h3>
        
        <div className="calendario-nav">
          <button className="btn-nav-mes" onClick={handlePrevMonth}>&larr;</button>
          <span className="calendario-mes-actual">{monthNames[month]} {year}</span>
          <button className="btn-nav-mes" onClick={handleNextMonth}>&rarr;</button>
        </div>
      </div>

      <div className="calendario-content-grid">
        {/* Lado Izquierdo: Cuadrícula Calendario */}
        <div className="calendario-wrapper">
          {cargando ? (
            <div className="calendario-cargando">
              <div className="spinner"></div>
              <p>Analizando historial de asistencias...</p>
            </div>
          ) : (
            <div className="calendario-table-box">
              <div className="calendario-dias-semana">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>
              <div className="calendario-dias-grid">
                {calendarDays.map((day, idx) => {
                  const esHoy = day.isCurrentMonth && 
                                day.dayNumber === new Date().getDate() && 
                                month === new Date().getMonth() && 
                                year === new Date().getFullYear();

                  let dayClass = "calendario-dia";
                  if (!day.isCurrentMonth) dayClass += " vacio";
                  if (day.hasAttended) dayClass += " asistido";
                  if (esHoy) dayClass += " hoy";
                  if (selectedDayDetail && selectedDayDetail.dateString === day.dateString) dayClass += " seleccionado";

                  return (
                    <button
                      key={idx}
                      className={dayClass}
                      onClick={() => handleDayClick(day)}
                      disabled={!day.isCurrentMonth}
                    >
                      <span className="dia-numero">{day.dayNumber}</span>
                      {day.hasAttended && <span className="dia-indicador"></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedDayDetail && (
            <div className="dia-detalle-box animate-slide-in">
              <h4>
                <ClockIcon size={16} color="var(--primary-color)" />
                Detalles del día {new Date(selectedDayDetail.entries[0].fecha_hora).toLocaleDateString("es-CO", { day: "numeric", month: "long" })}:
              </h4>
              <ul className="dia-detalle-ingresos">
                {selectedDayDetail.entries.map((entry, index) => (
                  <li key={index}>
                    ✅ Ingreso registrado a las <strong>{new Date(entry.fecha_hora).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Lado Derecho: Estadísticas clave para el módulo de Predicción de Deserción */}
        <div className="calendario-stats-box glass-panel">
          <h4 className="stats-box-title">Módulo de Retención & IA</h4>
          <p className="stats-box-subtitle">Indicadores clave de fidelidad del cliente</p>
          
          <div className="stat-metric-row">
            <div className="stat-metric-card">
              <span className="metric-number">{totalVisitasMes}</span>
              <span className="metric-label">Entrenamientos este mes</span>
            </div>
            <div className="stat-metric-card">
              <span className="metric-number">{rachaEntrenamientos} 🔥</span>
              <span className="metric-label">Racha de días seguidos</span>
            </div>
          </div>

          <div className="metric-progress-container">
            <div className="progress-info-row">
              <span className="progress-label">Consistencia del mes</span>
              <span className="progress-value">{consistenciaEntrenamiento}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${consistenciaEntrenamiento}%` }}></div>
            </div>
          </div>

          <div className="churn-prediction-card">
            <span className="churn-card-title">Predicción de Deserción (IA)</span>
            <div className="churn-status-indicator">
              <span className="churn-status-label">Estado de riesgo:</span>
              <span className="churn-status-value">{estadoDesercionIA}</span>
            </div>
            <p className="churn-prediction-tip">
              * Basado en la consistencia mensual y frecuencia de asistencias consecutivas de los últimos 30 días.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
