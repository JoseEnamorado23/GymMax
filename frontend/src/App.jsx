import { useState, useEffect, useCallback } from "react";
import UsuarioForm from "./components/UsuarioForm";
import UsuarioTable from "./components/UsuarioTable";
import PlanForm from "./components/PlanForm";
import PlanTable from "./components/PlanTable";
import SuscripcionModal from "./components/SuscripcionModal";
import AsistenciaScanner from "./components/AsistenciaScanner";
import Toast from "./components/Toast";
import PagosHistorico from "./components/PagosHistorico";
import {
  fetchUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  fetchPlanes,
  crearPlan,
  togglePlanActivo,
  crearSuscripcion,
  fetchPagos,
} from "./services/api";
import {
  DumbbellIcon,
  UsersIcon,
  ClipboardIcon,
  CameraIcon,
  WalletIcon,
  CalendarIcon
} from "./components/Icons";
import "./App.css";

function App() {
  const [seccion, setSeccion] = useState("usuarios");

  // --- Estado Usuarios ---
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [editando, setEditando] = useState(null);

  // --- Estado Planes ---
  const [planes, setPlanes] = useState([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(true);

  // --- Toast ---
  const [toast, setToast] = useState(null);

  // --- Suscripciones ---
  const [modalSuscripcion, setModalSuscripcion] = useState(null);

  // --- Estado Pagos ---
  const [pagos, setPagos] = useState([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);

  // --- Cargar datos ---
  const cargarUsuarios = useCallback(async () => {
    try {
      setCargandoUsuarios(true);
      const data = await fetchUsuarios();
      setUsuarios(data);
    } catch (err) {
      mostrarToast(err.message, "error");
    } finally {
      setCargandoUsuarios(false);
    }
  }, []);

  const cargarPlanes = useCallback(async () => {
    try {
      setCargandoPlanes(true);
      const data = await fetchPlanes(true); // traemos todos (activos e inactivos)
      setPlanes(data);
    } catch (err) {
      mostrarToast(err.message, "error");
    } finally {
      setCargandoPlanes(false);
    }
  }, []);

  const cargarPagos = useCallback(async () => {
    try {
      setCargandoPagos(true);
      const data = await fetchPagos();
      setPagos(data);
    } catch (err) {
      mostrarToast(err.message, "error");
    } finally {
      setCargandoPagos(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
    cargarPlanes();
    cargarPagos();
  }, [cargarUsuarios, cargarPlanes, cargarPagos]);

  function mostrarToast(mensaje, tipo = "success") {
    setToast({ mensaje, tipo });
  }

  // --- Handlers Usuarios ---
  async function handleCrearUsuario(data) {
    try {
      await crearUsuario(data);
      mostrarToast("Usuario registrado exitosamente");
      cargarUsuarios();
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  async function handleActualizarUsuario(data) {
    try {
      await actualizarUsuario(editando.id, data);
      mostrarToast("Usuario actualizado exitosamente");
      setEditando(null);
      cargarUsuarios();
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  async function handleDesactivar(id) {
    try {
      await desactivarUsuario(id);
      mostrarToast("Usuario desactivado");
      cargarUsuarios();
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  // --- Handlers Planes ---
  async function handleCrearPlan(data) {
    try {
      await crearPlan(data);
      mostrarToast("Plan creado exitosamente");
      cargarPlanes();
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  async function handleTogglePlan(id) {
    try {
      await togglePlanActivo(id);
      mostrarToast("Estado del plan actualizado");
      cargarPlanes();
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  // --- Handlers Suscripciones ---
  async function handleVenderPlan(data) {
    try {
      await crearSuscripcion(data);
      mostrarToast("Plan vendido y activado exitosamente");
      setModalSuscripcion(null);
      cargarUsuarios(); // Recargar usuarios para ver el plan actualizado en la tabla
      cargarPagos(); // Recargar pagos para reflejar la venta en el historial
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  return (
    <div className="dashboard-layout">
      {/* --- Barra de Navegación Lateral (Sidebar) --- */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo-icon">
            <DumbbellIcon size={32} />
          </span>
          <div className="sidebar-logo-text">
            <h2>Gym<span className="text-gradient-logo">Max</span></h2>
            <p className="sidebar-subtitle">Fitness Center</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-item ${seccion === "usuarios" ? "active" : ""}`}
            onClick={() => setSeccion("usuarios")}
            id="tab-usuarios"
          >
            <span className="menu-icon">
              <UsersIcon size={20} />
            </span>
            <span className="menu-text">Usuarios</span>
          </button>
          <button
            className={`menu-item ${seccion === "planes" ? "active" : ""}`}
            onClick={() => setSeccion("planes")}
            id="tab-planes"
          >
            <span className="menu-icon">
              <ClipboardIcon size={20} />
            </span>
            <span className="menu-text">Planes</span>
          </button>
          <button
            className={`menu-item ${seccion === "recepcion" ? "active" : ""}`}
            onClick={() => setSeccion("recepcion")}
            id="tab-recepcion"
          >
            <span className="menu-icon">
              <CameraIcon size={20} />
            </span>
            <span className="menu-text">Recepción (QR)</span>
          </button>
          <button
            className={`menu-item ${seccion === "finanzas" ? "active" : ""}`}
            onClick={() => setSeccion("finanzas")}
            id="tab-finanzas"
          >
            <span className="menu-icon">
              <WalletIcon size={20} />
            </span>
            <span className="menu-text">Finanzas</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div className="admin-info">
              <span className="admin-name">Administrador</span>
              <span className="admin-status">● En línea</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Área de Contenido Principal --- */}
      <div className="main-content">
        <header className="content-header">
          <div className="header-title-area">
            <span className="section-category">GymMax Panel</span>
            <h1 className="section-title">
              {seccion === "usuarios" && "Clientes & Suscripciones"}
              {seccion === "planes" && "Catálogo de Planes"}
              {seccion === "recepcion" && "Control de Accesos (QR)"}
              {seccion === "finanzas" && "Historial Financiero"}
            </h1>
          </div>
          <div className="header-actions-area">
            <div className="date-display" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <CalendarIcon size={16} color="#3b82f6" />
              <span style={{ textTransform: "capitalize" }}>
                {new Date().toLocaleDateString("es-CO", { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </header>

        <main className="content-body">
          {seccion === "usuarios" && (
            <section className="section-animate" key="usuarios">
              <UsuarioForm
                onSubmit={editando ? handleActualizarUsuario : handleCrearUsuario}
                editando={editando}
                onCancelar={() => setEditando(null)}
                planes={planes.filter(p => p.activo)} // solo planes activos
              />
              <UsuarioTable
                usuarios={usuarios}
                cargando={cargandoUsuarios}
                onEditar={(u) => setEditando(u)}
                onDesactivar={handleDesactivar}
                onVenderPlan={(u) => setModalSuscripcion(u)}
              />
            </section>
          )}

          {seccion === "planes" && (
            <section className="section-animate" key="planes">
              <PlanForm
                onSubmit={handleCrearPlan}
                editando={null}
                onCancelar={() => {}}
              />
              <PlanTable
                planes={planes}
                cargando={cargandoPlanes}
                onToggleActivo={handleTogglePlan}
              />
            </section>
          )}

          {seccion === "recepcion" && (
            <section className="section-animate" key="recepcion">
              <AsistenciaScanner 
                usuarios={usuarios} 
                mostrarToast={mostrarToast} 
              />
            </section>
          )}

          {seccion === "finanzas" && (
            <section className="section-animate" key="finanzas">
              <PagosHistorico
                pagos={pagos}
                cargando={cargandoPagos}
              />
            </section>
          )}
        </main>
      </div>

      {modalSuscripcion && (
        <SuscripcionModal
          usuario={modalSuscripcion}
          planes={planes.filter(p => p.activo)} // solo planes activos
          onClose={() => setModalSuscripcion(null)}
          onSubmit={handleVenderPlan}
        />
      )}

      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
