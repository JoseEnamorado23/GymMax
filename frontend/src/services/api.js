const API_BASE = `http://${window.location.hostname}:8000/api/v1`;

export async function fetchUsuarios() {
  const res = await fetch(`${API_BASE}/usuarios/`);
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
}

export async function crearUsuario(data) {
  const res = await fetch(`${API_BASE}/usuarios/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al crear usuario");
  }
  return res.json();
}

export async function actualizarUsuario(id, data) {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al actualizar usuario");
  }
  return res.json();
}

export async function desactivarUsuario(id) {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Error al desactivar usuario");
  return res.json();
}

export async function activarUsuario(id) {
  const res = await fetch(`${API_BASE}/usuarios/${id}/activar`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Error al activar usuario");
  return res.json();
}

// --- Planes ---

export async function fetchPlanes(incluirInactivos = false) {
  const url = incluirInactivos ? `${API_BASE}/planes/?incluir_inactivos=true` : `${API_BASE}/planes/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener planes");
  return res.json();
}

export async function crearPlan(data) {
  const res = await fetch(`${API_BASE}/planes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al crear plan");
  }
  return res.json();
}

export async function togglePlanActivo(id) {
  const res = await fetch(`${API_BASE}/planes/${id}/toggle_activo`, {
    method: "PUT",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al cambiar estado del plan");
  }
  return res.json();
}

// --- Suscripciones ---

export async function crearSuscripcion(data) {
  const res = await fetch(`${API_BASE}/suscripciones/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al registrar suscripción");
  }
  return res.json();
}

export async function fetchSuscripcionUsuario(usuarioId) {
  const res = await fetch(`${API_BASE}/suscripciones/usuario/${usuarioId}`);
  if (!res.ok) throw new Error("Error al obtener suscripción del usuario");
  return res.json();
}


// --- Asistencias ---

export async function marcarAsistencia(data) {
  const res = await fetch(`${API_BASE}/asistencias/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al registrar asistencia");
  }
  return res.json();
}

export async function fetchAsistencias(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.usuarioId) params.append("usuario_id", filtros.usuarioId);
  if (filtros.fechaInicio) params.append("fecha_inicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fecha_fin", filtros.fechaFin);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const url = `${API_BASE}/asistencias/${queryString}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener el historial de asistencias");
  return res.json();
}

export async function fetchPagos() {
  const res = await fetch(`${API_BASE}/pagos/`);
  if (!res.ok) throw new Error("Error al obtener el historial de pagos");
  return res.json();
}


// --- Entrenadores ---

export async function fetchEntrenadores() {
  const res = await fetch(`${API_BASE}/entrenadores/`);
  if (!res.ok) throw new Error("Error al obtener entrenadores");
  return res.json();
}

export async function crearEntrenador(data) {
  const res = await fetch(`${API_BASE}/entrenadores/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al crear entrenador");
  }
  return res.json();
}

export async function fetchLiquidaciones(mes = null, anio = null) {
  const params = new URLSearchParams();
  if (mes) params.append("mes", mes);
  if (anio) params.append("anio", anio);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/entrenadores/liquidacion/todos${qs}`);
  if (!res.ok) throw new Error("Error al obtener liquidaciones");
  return res.json();
}

export async function fetchLiquidacionEntrenador(id, mes = null, anio = null) {
  const params = new URLSearchParams();
  if (mes) params.append("mes", mes);
  if (anio) params.append("anio", anio);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/entrenadores/${id}/liquidacion${qs}`);
  if (!res.ok) throw new Error("Error al obtener liquidación del entrenador");
  return res.json();
}
