import { useState, useEffect } from "react";
import "./UsuarioForm.css";

const emptyForm = {
  nombre_completo: "",
  documento_identidad: "",
  telefono: "",
  foto_perfil: "",
  contacto_whatsapp: "",
  plan_id: "",
};

export default function UsuarioForm({ onSubmit, editando, onCancelar, planes }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editando) {
      setForm({
        nombre_completo: editando.nombre_completo,
        documento_identidad: editando.documento_identidad,
        telefono: editando.telefono,
        foto_perfil: editando.foto_perfil || "",
        contacto_whatsapp: editando.contacto_whatsapp || "",
        plan_id: editando.plan_id || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editando]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const submitData = { ...form };
    if (!submitData.plan_id) submitData.plan_id = null;
    onSubmit(submitData);
    if (!editando) setForm(emptyForm);
  }

  return (
    <form className="usuario-form glass-panel" onSubmit={handleSubmit} id="usuario-form">
      <h2>{editando ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h2>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="nombre_completo">Nombre Completo</label>
          <input
            type="text"
            id="nombre_completo"
            name="nombre_completo"
            placeholder="Ej: Juan Pérez"
            value={form.nombre_completo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="documento_identidad">Documento de Identidad</label>
          <input
            type="text"
            id="documento_identidad"
            name="documento_identidad"
            placeholder="Ej: 12345678"
            value={form.documento_identidad}
            onChange={handleChange}
            required
            disabled={!!editando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            placeholder="Ej: 300 123 4567"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contacto_whatsapp">WhatsApp (Opcional)</label>
          <input
            type="text"
            id="contacto_whatsapp"
            name="contacto_whatsapp"
            placeholder="Ej: 300 123 4567"
            value={form.contacto_whatsapp}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="foto_perfil">URL Foto de Perfil (Opcional)</label>
          <input
            type="url"
            id="foto_perfil"
            name="foto_perfil"
            placeholder="Ej: https://ejemplo.com/foto.jpg"
            value={form.foto_perfil}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="plan_id">Plan de Gimnasio</label>
          <select
            id="plan_id"
            name="plan_id"
            value={form.plan_id}
            onChange={handleChange}
            style={{ padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(15, 23, 42, 0.6)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none" }}
          >
            <option value="">-- Sin Plan (Pago por día / Ninguno) --</option>
            {planes && planes.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.nombre} - ${plan.precio.toLocaleString("es-CO")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" id="btn-submit-usuario">
          {editando ? "Guardar Cambios" : "Registrar Usuario"}
        </button>
        {editando && (
          <button type="button" className="btn-secondary" onClick={onCancelar} id="btn-cancelar-edicion">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
