import { useState, useEffect, useCallback } from "react";
import UsuarioForm from "./components/UsuarioForm";
import UsuarioTable from "./components/UsuarioTable";
import PlanForm from "./components/PlanForm";
import PlanTable from "./components/PlanTable";
import SuscripcionModal from "./components/SuscripcionModal";
import AsistenciaScanner from "./components/AsistenciaScanner";
import Toast from "./components/Toast";
import {
  fetchUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  fetchPlanes,
  crearPlan,
  togglePlanActivo,
  crearSuscripcion,
} from "./services/api";
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

  useEffect(() => {
    cargarUsuarios();
    cargarPlanes();
  }, [cargarUsuarios, cargarPlanes]);

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
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  }

  return (
    <div className="app-container">
      <header className="app-header" id="app-header">
        <div className="logo">
          <span className="logo-icon">💪</span>
          <h1>Gym<span className="text-gradient">Max</span></h1>
        </div>
        <p className="subtitle">Panel de Administración</p>
      </header>

      {/* --- Navegación por Pestañas --- */}
      <nav className="tab-nav" id="main-nav">
        <button
          className={`tab-btn ${seccion === "usuarios" ? "tab-active" : ""}`}
          onClick={() => setSeccion("usuarios")}
          id="tab-usuarios"
        >
          <span className="tab-icon">👥</span>
          Usuarios
        </button>
        <button
          className={`tab-btn ${seccion === "planes" ? "tab-active" : ""}`}
          onClick={() => setSeccion("planes")}
          id="tab-planes"
        >
          <span className="tab-icon">📋</span>
          Planes
        </button>
        <button
          className={`tab-btn ${seccion === "recepcion" ? "tab-active" : ""}`}
          onClick={() => setSeccion("recepcion")}
          id="tab-recepcion"
        >
          <span className="tab-icon">📷</span>
          Recepción (QR)
        </button>
      </nav>

      {/* --- Contenido --- */}
      <main>
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
      </main>

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
