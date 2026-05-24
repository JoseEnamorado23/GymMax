from sqlalchemy import Column, String, Text, Enum
import enum
from app.db.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class GrupoMuscular(str, enum.Enum):
    pecho = "pecho"
    espalda = "espalda"
    piernas = "piernas"
    hombros = "hombros"
    brazos = "brazos"
    core = "core"
    cuerpo_completo = "cuerpo_completo"
    cardio = "cardio"

class TipoEjercicio(str, enum.Enum):
    fuerza = "fuerza"
    cardio = "cardio"
    flexibilidad = "flexibilidad"
    funcional = "funcional"

class DificultadEjercicio(int, enum.Enum):
    principiante = 1
    intermedio = 2
    avanzado = 3

class Ejercicio(Base):
    __tablename__ = "ejercicios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, index=True, nullable=False)
    grupo_muscular = Column(Enum(GrupoMuscular), nullable=False)
    tipo = Column(Enum(TipoEjercicio), nullable=False)
    video_url = Column(String, nullable=True)
    descripcion = Column(Text, nullable=True)
    equipo_requerido = Column(String, nullable=False)
    dificultad = Column(Enum(DificultadEjercicio), nullable=False)
