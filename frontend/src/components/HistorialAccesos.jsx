import { useState, useEffect, useMemo } from "react";
import { ClockIcon, CalendarIcon } from "./Icons";
import { fetchAsistencias } from "../services/api";
import "./HistorialAccesos.css";

export default function HistorialAccesos() {
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const [monthlyCounts, setMonthlyCounts] = useState({});

  // Estados del calendario
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  // Cargar historial cuando cambie el selectedDate
  useEffect(() => {
    async function cargarHistorial() {
      setCargandoHistorial(true);
      try {
        // Rango del día seleccionado: desde las 00:00:00 hasta las 23:59:59
        const fechaInicio = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const fechaFin = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);

        const data = await fetchAsistencias({
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString(),
        });
        setHistorial(data);
      } catch (err) {
        console.error("Error al cargar historial de asistencias:", err);
      } finally {
        setCargandoHistorial(false);
      }
    }
    
    cargarHistorial();
  }, [selectedDate]);

  // Cargar conteos mensuales cuando cambia el mes actual
  useEffect(() => {
    async function cargarConteosMensuales() {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1, 0, 0, 0);
        const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

        const data = await fetchAsistencias({
          fechaInicio: firstDay.toISOString(),
          fechaFin: lastDay.toISOString(),
        });

        const counts = {};
        data.forEach(asist => {
          // Obtener fecha en formato local YYYY-MM-DD
          const d = new Date(asist.fecha_hora);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        });

        setMonthlyCounts(counts);
      } catch (err) {
        console.error("Error al cargar conteos mensuales:", err);
      }
    }

    cargarConteosMensuales();
  }, [currentMonth]);

  // Generación de los días del mes para el calendario
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Obtener el día de la semana en el que empieza el mes (0 = Domingo, 1 = Lunes...)
    // Ajustaremos para que la semana empiece el Lunes (1) en lugar de Domingo (0)
    let firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    
    // Rellenar días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    
    // Rellenar días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Rellenar días del mes siguiente para completar la cuadrícula (42 días = 6 semanas)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentMonth]);

  // Navegación del mes
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="historial-layout-v2" id="historial-accesos-layout">
      
      {/* Columna Izquierda: Calendario */}
      <div className="calendario-side glass-panel">
        <div className="calendario-header-v2">
          <h2>
            <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: "8px" }}>
              <CalendarIcon size={24} color="var(--accent-hover)" />
            </span>
            Calendario
          </h2>
          <button className="btn-secondary btn-today" onClick={handleToday}>Hoy</button>
        </div>

        <div className="calendario-nav">
          <button onClick={handlePrevMonth} className="btn-icon">‹</button>
          <span className="mes-actual">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
          <button onClick={handleNextMonth} className="btn-icon">›</button>
        </div>

        <div className="calendario-grid">
          {weekDays.map(day => (
            <div key={day} className="cal-day-header">{day}</div>
          ))}
          
          {calendarDays.map((dayObj, i) => {
            const isSelected = isSameDay(dayObj.date, selectedDate);
            const isTodayDate = isSameDay(dayObj.date, today);
            
            const dateStr = `${dayObj.date.getFullYear()}-${String(dayObj.date.getMonth() + 1).padStart(2, '0')}-${String(dayObj.date.getDate()).padStart(2, '0')}`;
            const count = monthlyCounts[dateStr] || 0;
            
            return (
              <button 
                key={i} 
                className={`cal-day-cell ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
                onClick={() => setSelectedDate(dayObj.date)}
              >
                {count > 0 && <span className="day-count">{count}</span>}
                <span className="day-number">{dayObj.date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Columna Derecha: Lista de Accesos del día seleccionado */}
      <div className="lista-side glass-panel">
        <div className="historial-header">
          <h2>
            <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: "8px" }}>
              <ClockIcon size={24} color="#3b82f6" />
            </span>
            Ingresos: {selectedDate.toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p>Mostrando los ingresos registrados para el día seleccionado.</p>
        </div>

        <div className="historial-body">
          {cargandoHistorial ? (
            <div className="cargando-spinner">Cargando ingresos...</div>
          ) : historial.length === 0 ? (
            <div className="no-data-container">
               <p className="no-data">No hay ingresos registrados en esta fecha.</p>
            </div>
          ) : (
            <div className="historial-list">
              {historial.map((asist) => {
                const fecha = new Date(asist.fecha_hora);
                const horaStr = fecha.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
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
