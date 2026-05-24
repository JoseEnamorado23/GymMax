from sqlalchemy import Column, String, Boolean, ForeignKey, Date, Text, Enum, Integer
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class ObjetivoRutina(str, enum.Enum):
    fuerza = "fuerza"
    perdida_peso = "pérdida de peso"
    resistencia = "resistencia"
    ganancia_muscular = "ganancia muscular"

class Rutina(Base):
    __tablename__ = "rutinas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    entrenador_id = Column(UUID(as_uuid=True), ForeignKey("entrenadores.id"), nullable=False)
    nombre = Column(String, nullable=False)
    objetivo = Column(Enum(ObjetivoRutina), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    activa = Column(Boolean, default=True)
    semanas_duracion = Column(Integer, nullable=False)
    notas_entrenador = Column(Text, nullable=True)

    # Relaciones
    usuario = relationship("Usuario", backref="rutinas")
    entrenador = relationship("Entrenador", backref="rutinas_asignadas")
    dias = relationship("DiaRutina", back_populates="rutina", cascade="all, delete-orphan")
