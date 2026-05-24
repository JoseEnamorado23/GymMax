const API_BASE = "http://localhost:8000/api/v1";

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

export async function fetchAsistencias() {
  const res = await fetch(`${API_BASE}/asistencias/`);
  if (!res.ok) throw new Error("Error al obtener el historial de asistencias");
  return res.json();
}

