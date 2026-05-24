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

export async function fetchPlanes() {
  const res = await fetch(`${API_BASE}/planes/`);
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
