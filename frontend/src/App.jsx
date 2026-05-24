import { useState, useEffect, useCallback } from "react";
import UsuarioFormModal from "./components/UsuarioFormModal";
import UsuarioTable from "./components/UsuarioTable";
import ConfirmModal from "./components/ConfirmModal";
import PlanFormModal from "./components/PlanFormModal";
import PlanTable from "./components/PlanTable";
import SuscripcionModal from "./components/SuscripcionModal";
import AsistenciaScanner from "./components/AsistenciaScanner";
import HistorialAccesos from "./components/HistorialAccesos";
import Toast from "./components/Toast";
import PagosHistorico from "./components/PagosHistorico";
import PortalCliente from "./components/PortalCliente";
import AsistenciaCalendarioModal from "./components/AsistenciaCalendarioModal";
import Entrenadores from "./components/Entrenadores";
import Liquidaciones from "./components/Liquidaciones";
import ClasesAdmin from "./components/ClasesAdmin";
import HorarioAdmin from "./components/HorarioAdmin";
import RutinasAdmin from "./components/RutinasAdmin";
import SocioApp from "./components/SocioApp";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  fetchUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
  fetchPlanes,
  crearPlan,
  togglePlanActivo,
  crearSuscripcion,
  fetchPagos,
  fetchEntrenadores,
} from "./services/api";
import {
  DumbbellIcon,
  UsersIcon,
  ClipboardIcon,
  CameraIcon,
  WalletIcon,
  CalendarIcon,
  ClockIcon
} from "./components/Icons";
import "./App.css";

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    return <SocioApp token={token} />;
  }

  const [seccion, setSeccion] = useState("usuarios");
  
  // --- Simulación de Portal de Cliente ---
  const [vistaRol, setVistaRol] = useState("admin"); // 'admin' o 'cliente'
  const [clienteSimuladoId, setClienteSimuladoId] = useState("");
  const [asistenciaCalendarioUsuario, setAsistenciaCalendarioUsuario] = useState(null); // Para modal de admin

  // --- Estado Usuarios ---
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [editando, setEditando] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState(null); // { usuario, accion: 'activar' | 'desactivar' }

  // --- Estado Planes ---
  const [planes, setPlanes] = useState([]);
  const [cargandoPlanes, setCargandoPlanes] = useState(true);
  const [showPlanFormModal, setShowPlanFormModal] = useState(false);
  const [confirmPlanModalData, setConfirmPlanModalData] = useState(null); // { plan, accion: 'activar' | 'desactivar' }

  // --- Toast ---
  const [toast, setToast] = useState(null);

  // --- Suscripciones ---
  const [modalSuscripcion, setModalSuscripcion] = useState(null);

  // --- Estado Pagos ---
  const [pagos, setPagos] = useState([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);

  // --- Estado Entrenadores ---
  const [entrenadores, setEntrenadores] = useState([]);

  // --- Cargar datos ---
  const cargarUsuarios = useCallback(async () => {
    try {
      setCargandoUsuarios(true);
      const data = await fetchUsuarios();
      setUsuarios(data);
      if (Array.isArray(data) && data.length > 0) {
        setClienteSimuladoId(prev => prev || data[0].id);
      }
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

  const cargarEntrenadores = useCallback(async () => {
    try {
      const data = await fetchEntrenadores();
      setEntrenadores(data.filter(e => e.activo));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
    cargarPlanes();
    cargarPagos();
    cargarEntrenadores();
  }, [cargarUsuarios, cargarPlanes, cargarPagos, cargarEntrenadores]);

  function mostrarToast(mensaje, tipo = "success") {
    setToast({ mensaje, tipo });
  }

  // --- Handlers Usuarios ---
  async function handleCrearUsuario(data) {
    try {
      await crearUsuario(data);
      mostrarToast("Usuario registrado exitosamente");
      setShowFormModal(false);
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
      setShowFormModal(false);
      cargarUsuarios();
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  function preDesactivar(usuario) {
    setConfirmModalData({
      usuario,
      accion: "desactivar"
    });
  }

  function preActivar(usuario) {
    setConfirmModalData({
      usuario,
      accion: "activar"
    });
  }

  async function ejecutarAccionConfirmada() {
    if (!confirmModalData) return;
    const { usuario, accion } = confirmModalData;
    try {
      if (accion === "desactivar") {
        await desactivarUsuario(usuario.id);
        mostrarToast("Usuario desactivado exitosamente");
      } else if (accion === "activar") {
        await activarUsuario(usuario.id);
        mostrarToast("Usuario activado exitosamente");
      }
      cargarUsuarios();
    } catch (err) {
      mostrarToast(err.message, "error");
    } finally {
      setConfirmModalData(null);
    }
  }

  // --- Handlers Planes ---
  async function handleCrearPlan(data) {
    try {
      await crearPlan(data);
      mostrarToast("Plan creado exitosamente");
      setShowPlanFormModal(false);
      cargarPlanes();
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  function preTogglePlan(plan) {
    setConfirmPlanModalData({
      plan,
      accion: plan.activo ? "desactivar" : "activar"
    });
  }

  async function ejecutarTogglePlanConfirmado() {
    if (!confirmPlanModalData) return;
    const { plan } = confirmPlanModalData;
    try {
      await togglePlanActivo(plan.id);
      mostrarToast("Estado del plan actualizado");
      cargarPlanes();
    } catch (err) {
      mostrarToast(err.message, "error");
    } finally {
      setConfirmPlanModalData(null);
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
          {vistaRol === "admin" ? (
            <>
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
                className={`menu-item ${seccion === "historial" ? "active" : ""}`}
                onClick={() => setSeccion("historial")}
                id="tab-historial"
              >
                <span className="menu-icon">
                  <ClockIcon size={20} />
                </span>
                <span className="menu-text">Historial Accesos</span>
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
              <button
                className={`menu-item ${seccion === "entrenadores" ? "active" : ""}`}
                onClick={() => setSeccion("entrenadores")}
                id="tab-entrenadores"
              >
                <span className="menu-icon">
                  <UsersIcon size={20} />
                </span>
                <span className="menu-text">Entrenadores</span>
              </button>
              <button
                className={`menu-item ${seccion === "liquidaciones" ? "active" : ""}`}
                onClick={() => setSeccion("liquidaciones")}
                id="tab-liquidaciones"
              >
                <span className="menu-icon">
                  <WalletIcon size={20} />
                </span>
                <span className="menu-text">Liquidaciones</span>
              </button>
              <button
                className={`menu-item ${seccion === "clases" ? "active" : ""}`}
                onClick={() => setSeccion("clases")}
                id="tab-clases"
              >
                <span className="menu-icon">
                  <ClipboardIcon size={20} />
                </span>
                <span className="menu-text">Clases</span>
              </button>
              <button
                className={`menu-item ${seccion === "horarios" ? "active" : ""}`}
                onClick={() => setSeccion("horarios")}
                id="tab-horarios"
              >
                <span className="menu-icon">
                  <CalendarIcon size={20} />
                </span>
                <span className="menu-text">Horarios</span>
              </button>
              <button
                className={`menu-item ${seccion === "rutinas" ? "active" : ""}`}
                onClick={() => setSeccion("rutinas")}
                id="tab-rutinas"
              >
                <span className="menu-icon">
                  <DumbbellIcon size={20} />
                </span>
                <span className="menu-text">Entrenamiento</span>
              </button>
            </>
          ) : (
            <button
              className={`menu-item ${seccion === "cliente-portal" ? "active" : ""}`}
              onClick={() => setSeccion("cliente-portal")}
              id="tab-cliente-portal"
            >
              <span className="menu-icon">
                <UsersIcon size={20} />
              </span>
              <span className="menu-text">Mi Portal</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Conmutador de Roles */}
          <div className="role-switch-container">
            <span className="role-switch-label">VISTA ACTUAL:</span>
            <div className="role-switch-buttons">
              <button 
                className={`btn-role-switch ${vistaRol === "admin" ? "active" : ""}`}
                onClick={() => { 
                  setVistaRol("admin"); 
                  setSeccion("usuarios"); 
                }}
              >
                Admin
              </button>
              <button 
                className={`btn-role-switch ${vistaRol === "cliente" ? "active" : ""}`}
                onClick={() => { 
                  setVistaRol("cliente"); 
                  setSeccion("cliente-portal"); 
                  if (!clienteSimuladoId && usuarios.length > 0) {
                    setClienteSimuladoId(usuarios[0].id);
                  }
                }}
              >
                Cliente
              </button>
            </div>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">{vistaRol === "admin" ? "A" : "C"}</div>
            <div className="admin-info">
              <span className="admin-name">{vistaRol === "admin" ? "Administrador" : "Portal Cliente"}</span>
              <span className="admin-status">● Simulación</span>
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
              {seccion === "historial" && "Historial de Accesos Recientes"}
              {seccion === "finanzas" && "Historial Financiero"}
              {seccion === "entrenadores" && "Directorio de Entrenadores"}
              {seccion === "liquidaciones" && "Cálculo de Comisiones"}
              {seccion === "clases" && "Gestión de Clases"}
              {seccion === "horarios" && "Gestión de Horarios"}
              {seccion === "rutinas" && "Planes de Entrenamiento"}
              {seccion === "cliente-portal" && "Portal Digital del Cliente"}
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
          {seccion === "usuarios" ? (
            <section className="section-animate" key="usuarios">
              <UsuarioTable
                usuarios={usuarios}
                cargando={cargandoUsuarios}
                onEditar={(u) => { setEditando(u); setShowFormModal(true); }}
                onDesactivar={preDesactivar}
                onActivar={preActivar}
                onNuevoUsuario={() => { setEditando(null); setShowFormModal(true); }}
                onVenderPlan={(u) => setModalSuscripcion(u)}
                onVerAsistencia={(u) => setAsistenciaCalendarioUsuario(u)}
              />
            </section>
          ) : null}

          {seccion === "cliente-portal" ? (
            <section className="section-animate" key="cliente-portal">
              <PortalCliente
                usuarios={usuarios}
                clienteSimuladoId={clienteSimuladoId}
                onCambiarCliente={(id) => setClienteSimuladoId(id)}
              />
            </section>
          ) : null}

          {seccion === "planes" ? (
            <section className="section-animate" key="planes">
              <PlanTable
                planes={planes}
                cargando={cargandoPlanes}
                onToggleActivo={preTogglePlan}
                onNuevoPlan={() => setShowPlanFormModal(true)}
              />
            </section>
          ) : null}

          {seccion === "recepcion" ? (
            <section className="section-animate" key="recepcion">
              <AsistenciaScanner 
                usuarios={usuarios} 
                mostrarToast={mostrarToast} 
              />
            </section>
          ) : null}

          {seccion === "historial" ? (
            <section className="section-animate" key="historial">
              <HistorialAccesos />
            </section>
          ) : null}

          {seccion === "finanzas" ? (
            <section className="section-animate" key="finanzas">
              <PagosHistorico
                pagos={pagos}
                cargando={cargandoPagos}
              />
            </section>
          ) : null}

          {seccion === "entrenadores" ? (
            <section className="section-animate" key="entrenadores">
              <Entrenadores />
            </section>
          ) : null}

          {seccion === "liquidaciones" ? (
            <section className="section-animate" key="liquidaciones">
              <Liquidaciones />
            </section>
          ) : null}

          {seccion === "clases" ? (
            <section className="section-animate" key="clases">
              <ClasesAdmin />
            </section>
          ) : null}

          {seccion === "horarios" ? (
            <section className="section-animate" key="horarios">
              <HorarioAdmin />
            </section>
          ) : null}

          {seccion === "rutinas" ? (
            <section className="section-animate" key="rutinas">
              <ErrorBoundary>
                <RutinasAdmin />
              </ErrorBoundary>
            </section>
          ) : null}
        </main>
      </div>

      {modalSuscripcion ? (
        <SuscripcionModal
          usuario={modalSuscripcion}
          planes={planes.filter(p => p.activo)} // solo planes activos
          entrenadores={entrenadores}
          onClose={() => setModalSuscripcion(null)}
          onSubmit={handleVenderPlan}
        />
      ) : null}

      {showFormModal ? (
        <UsuarioFormModal
          isOpen={showFormModal}
          onClose={() => { setShowFormModal(false); setEditando(null); }}
          onSubmit={editando ? handleActualizarUsuario : handleCrearUsuario}
          editando={editando}
        />
      ) : null}

      {confirmModalData ? (
        <ConfirmModal
          isOpen={!!confirmModalData}
          onClose={() => setConfirmModalData(null)}
          onConfirm={ejecutarAccionConfirmada}
          title={confirmModalData.accion === "activar" ? "Activar Usuario" : "Desactivar Usuario"}
          message={
            confirmModalData.accion === "activar"
              ? `¿Estás seguro de que deseas activar a ${confirmModalData.usuario.nombre_completo}? Esto le permitirá registrar asistencias y comprar planes.`
              : `¿Estás seguro de que deseas desactivar a ${confirmModalData.usuario.nombre_completo}? Esto suspenderá sus accesos y servicios temporalmente.`
          }
          confirmText={confirmModalData.accion === "activar" ? "Activar" : "Desactivar"}
          type={confirmModalData.accion === "activar" ? "success" : "danger"}
        />
      ) : null}

      {showPlanFormModal ? (
        <PlanFormModal
          isOpen={showPlanFormModal}
          onClose={() => setShowPlanFormModal(false)}
          onSubmit={handleCrearPlan}
        />
      ) : null}

      {confirmPlanModalData ? (
        <ConfirmModal
          isOpen={!!confirmPlanModalData}
          onClose={() => setConfirmPlanModalData(null)}
          onConfirm={ejecutarTogglePlanConfirmado}
          title={confirmPlanModalData.accion === "activar" ? "Activar Plan" : "Desactivar Plan"}
          message={
            confirmPlanModalData.accion === "activar"
              ? `¿Estás seguro de que deseas activar el plan "${confirmPlanModalData.plan.nombre}"? Volverá a estar disponible para vender a los clientes.`
              : `¿Estás seguro de que deseas desactivar el plan "${confirmPlanModalData.plan.nombre}"? Ya no se podrá asignar a nuevos clientes.`
          }
          confirmText={confirmPlanModalData.accion === "activar" ? "Activar" : "Desactivar"}
          type={confirmPlanModalData.accion === "activar" ? "success" : "danger"}
        />
      ) : null}

      {asistenciaCalendarioUsuario ? (
        <AsistenciaCalendarioModal
          isOpen={!!asistenciaCalendarioUsuario}
          onClose={() => setAsistenciaCalendarioUsuario(null)}
          usuarioId={asistenciaCalendarioUsuario.id}
          usuarioNombre={asistenciaCalendarioUsuario.nombre_completo}
        />
      ) : null}

      {toast ? (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}

export default App;
