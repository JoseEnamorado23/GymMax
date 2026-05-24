from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date
from app.models.ejercicio import GrupoMuscular, TipoEjercicio, DificultadEjercicio
from app.models.rutina import ObjetivoRutina

# --- Ejercicio ---
class EjercicioBase(BaseModel):
    nombre: str
    grupo_muscular: GrupoMuscular
    tipo: TipoEjercicio
    video_url: Optional[str] = None
    descripcion: Optional[str] = None
    equipo_requerido: str
    dificultad: DificultadEjercicio

class EjercicioCreate(EjercicioBase):
    pass

class EjercicioResponse(EjercicioBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# --- EjercicioRutina ---
class EjercicioRutinaBase(BaseModel):
    ejercicio_id: UUID
    orden: int
    series: int
    repeticiones: str
    peso_kg: Optional[float] = None
    descanso_seg: int
    notas: Optional[str] = None

class EjercicioRutinaCreate(EjercicioRutinaBase):
    pass

class EjercicioRutinaResponse(EjercicioRutinaBase):
    id: UUID
    dia_rutina_id: UUID
    ejercicio: EjercicioResponse
    model_config = ConfigDict(from_attributes=True)

# --- DiaRutina ---
class DiaRutinaBase(BaseModel):
    dia_numero: int
    nombre_dia: str
    orden: int

class DiaRutinaCreate(DiaRutinaBase):
    ejercicios: List[EjercicioRutinaCreate] = []

class DiaRutinaResponse(DiaRutinaBase):
    id: UUID
    rutina_id: UUID
    ejercicios_rutina: List[EjercicioRutinaResponse] = []
    model_config = ConfigDict(from_attributes=True)

# --- Rutina ---
class RutinaBase(BaseModel):
    nombre: str
    objetivo: ObjetivoRutina
    fecha_inicio: date
    semanas_duracion: int
    notas_entrenador: Optional[str] = None

class RutinaCreate(RutinaBase):
    entrenador_id: UUID
    dias: List[DiaRutinaCreate] = []

class RutinaResponse(RutinaBase):
    id: UUID
    usuario_id: UUID
    entrenador_id: UUID
    fecha_fin: Optional[date] = None
    activa: bool
    dias: List[DiaRutinaResponse] = []
    model_config = ConfigDict(from_attributes=True)

# --- RegistroEjercicio ---
class RegistroEjercicioCreate(BaseModel):
    ejercicio_rutina_id: UUID
    series_completadas: int
    reps_completadas: str
    peso_real_kg: Optional[float] = None
    completado: bool = True
    sensacion: int # 1-5
    nota_socio: Optional[str] = None

class RegistroEjercicioResponse(RegistroEjercicioCreate):
    id: UUID
    usuario_id: UUID
    fecha: date
    model_config = ConfigDict(from_attributes=True)
