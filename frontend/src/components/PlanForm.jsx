import { useState, useEffect } from "react";
import "./PlanForm.css";

const emptyForm = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_dias: "",
};

export default function PlanForm({ onSubmit, editando, onCancelar }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editando) {
      setForm({
        nombre: editando.nombre,
        descripcion: editando.descripcion || "",
        precio: editando.precio,
        duracion_dias: editando.duracion_dias,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editando]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      precio: parseFloat(form.precio),
      duracion_dias: parseInt(form.duracion_dias, 10),
      descripcion: form.descripcion || null,
    });
    if (!editando) setForm(emptyForm);
  }

  return (
    <form className="plan-form glass-panel" onSubmit={handleSubmit} id="plan-form">
      <h2>{editando ? "✏️ Editar Plan" : "📋 Crear Nuevo Plan"}</h2>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="plan-nombre">Nombre del Plan</label>
          <input
            type="text"
            id="plan-nombre"
            name="nombre"
            placeholder='Ej: Mensualidad General'
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="plan-precio">Precio ($)</label>
          <input
            type="number"
            id="plan-precio"
            name="precio"
            placeholder="Ej: 80000"
            value={form.precio}
            onChange={handleChange}
            min="0"
            step="any"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="plan-duracion">Duración (días)</label>
          <input
            type="number"
            id="plan-duracion"
            name="duracion_dias"
            placeholder="Ej: 30"
            value={form.duracion_dias}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group form-group-full">
          <label htmlFor="plan-descripcion">Descripción (opcional)</label>
          <textarea
            id="plan-descripcion"
            name="descripcion"
            placeholder="Ej: Acceso completo al gimnasio de lunes a sábado"
            value={form.descripcion}
            onChange={handleChange}
            rows="2"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" id="btn-submit-plan">
          {editando ? "Guardar Cambios" : "Crear Plan"}
        </button>
        {editando && (
          <button type="button" className="btn-secondary" onClick={onCancelar} id="btn-cancelar-plan">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
